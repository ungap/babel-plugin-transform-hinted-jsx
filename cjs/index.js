'use strict';
const JSX_ANNOTATION_REGEX = /\*?\s*@jsx\s+([^\s]+)/;
const JSX_FRAG_ANNOTATION_REGEX = /\*?\s*@jsxFrag\s+([^\s]+)/;
const JSX_INTERPOLATION_ANNOTATION_REGEX = /\*?\s*@jsxInterpolation\s+([^\s]+)/;

module.exports = ({types: t}) => {
  let pragma = '', pragmaFrag = '', pragmaPrefix = '', pragmaInterpolation = '';

  const interpolation = () => {
    return (
      pragmaInterpolation ||
      ((pragmaPrefix || 'React') + '.interpolation')
    );
  };

  const fixSkippedJSXExpressionContainer = ({node: {children}}) => {
    for (const node of children) {
      if (node.type === 'JSXExpressionContainer')
        JSXExpressionContainer({node});
    }
  };

  function JSXExpressionContainer(path) {
    const {expression} = path.node;
    path.node.expression = t.callExpression(
      toMemberExpression(interpolation()),
      [expression]
    );
  }

  return {
    visitor: {
      Program: {
        enter(_, state) {
          const {file: {ast: {comments}}} = state;
          if (comments) {
            for (const comment of comments) {
              if (JSX_ANNOTATION_REGEX.test(comment.value)) {
                pragma = RegExp.$1;
                [pragmaPrefix] = pragma.split('.');
              }
              else if (JSX_FRAG_ANNOTATION_REGEX.test(comment.value))
                pragmaFrag = RegExp.$1;
              else if (JSX_INTERPOLATION_ANNOTATION_REGEX.test(comment.value))
                pragmaInterpolation = RegExp.$1;
            }
          }
        }
      },
      FunctionDeclaration(path) {
        if (path.node.id.name === '_extends' && path.parentPath.type === 'Program') {
          console.warn(
            '\x1b[1mWARNING\x1b[0m: _extends override is not supported.\n',
            '        Use `{"useSpread": true}` option.'
          );
        }
      },
      SpreadElement(path) {
        const {parentPath} = path.parentPath;
        if (parentPath && parentPath.isCallExpression()) {
          const name = getCalleeName(parentPath.node.callee);
          if (
            name === pragma ||
            name === (pragma || 'React.createElement')
          ) {
            const {callee} = path.parentPath.node;
            if (callee && getCalleeName(callee) === interpolation())
              return;
            path.parentPath.replaceWith(
              t.inherits(
                t.callExpression(
                  toMemberExpression(interpolation()),
                  [path.parentPath.node]
                ),
                path.parentPath
              )
            );
          }
        }
      },
      JSXExpressionContainer,
      JSXElement(path) {
        if (!path.parentPath.isJSX() && !path.parentPath.isCallExpression()) {
          fixSkippedJSXExpressionContainer(path);
          const openingPath = path.get('openingElement');
          const attributes = openingPath.get('attributes');
          const callExpr = t.callExpression(
            toMemberExpression((pragma || 'React.createElement') + '``'),
            [
              getTag(openingPath),
              attributes.length ?
                t.objectExpression(attributes.reduce(accumulateAttribute, [])) :
                t.nullLiteral(),
              ...t.react.buildChildren(path.node),
            ]
          );
          path.replaceWith(t.inherits(callExpr, path.node));
        }
      },
      JSXFragment(path) {
        if (!path.parentPath.isJSX() && !path.parentPath.isCallExpression()) {
          fixSkippedJSXExpressionContainer(path);
          const callExpr = t.callExpression(
            toMemberExpression((pragma || 'React.createElement') + '``'),
            [
              toMemberExpression(pragmaFrag || 'React.Fragment'),
              t.nullLiteral(),
              ...t.react.buildChildren(path.node)
            ]
          );
          path.replaceWith(t.inherits(callExpr, path.node));
        }
      }
    }
  };

  /*!
   * (c) Babel Project - MIT License
   * The following code has been taken and slightly readapted from
   * https://github.com/babel/babel/blob/0058b7fef4d028d2826645b28e3b448517cd979d/packages/babel-plugin-transform-react-jsx/src/create-plugin.ts
   */
  function accumulateAttribute(array, attribute) {
    if (t.isJSXSpreadAttribute(attribute.node)) {
      const arg = attribute.node.argument;
      if (t.isObjectExpression(arg)) {
        array.push(...arg.properties);
      } else {
        array.push(t.spreadElement(arg));
      }
      return array;
    }

    const value = convertAttributeValue(
      attribute.node.name.name !== "key"
        ? attribute.node.value || t.booleanLiteral(true)
        : attribute.node.value,
    );

    if (attribute.node.name.name === "key" && value === null) {
      throw attribute.buildCodeFrameError(
        'Please provide an explicit key value. Using "key" as a shorthand for "key={true}" is not allowed.',
      );
    }

    if (
      t.isStringLiteral(value) &&
      !t.isJSXExpressionContainer(attribute.node.value)
    ) {
      value.value = value.value.replace(/\n\s+/g, " ");
      delete value.extra?.raw;
    }

    const {name} = attribute.node;
    if (t.isJSXNamespacedName(name)) {
      attribute.node.name = t.stringLiteral(
        `${name.namespace.name}:${name.name.name}`
      );
    } else if (t.isValidIdentifier(name.name, false)) {
      name.type = "Identifier";
    } else {
      attribute.node.name = t.stringLiteral(name.name);
    }

    array.push(
      t.inherits(
        t.objectProperty(
          attribute.node.name,
          value,
        ),
        attribute.node,
      ),
    );
    return array;
  }

  function convertAttributeValue(node) {
    return t.isJSXExpressionContainer(node) ?
      t.callExpression(
        toMemberExpression(interpolation()),
        [node.expression]
      ) :
      node;
  }

  function convertJSXIdentifier(node, parent) {
    if (t.isJSXIdentifier(node)) {
      if (node.name === 'this' && t.isReferenced(node, parent)) {
        return t.thisExpression();
      } else if (t.isValidIdentifier(node.name, false)) {
        node.type = 'Identifier';
      } else {
        return t.stringLiteral(node.name);
      }
    }
    else if (t.isJSXMemberExpression(node)) {
      return t.memberExpression(
        convertJSXIdentifier(node.object, node),
        convertJSXIdentifier(node.property, node),
      );
    }
    else if (t.isJSXNamespacedName(node))
      return t.stringLiteral(`${node.namespace.name}:${node.name.name}`);

    return node;
  }

  function getCalleeName({object, property, name}) {
    return name || [object.name, property.name].join('.');
  }

  function getTag(openingPath) {
    const tagExpr = convertJSXIdentifier(
      openingPath.node.name,
      openingPath.node,
    );

    let tagName;
    if (t.isIdentifier(tagExpr))
      tagName = tagExpr.name;
    else if (t.isLiteral(tagExpr))
      tagName = tagExpr.value;

    return t.react.isCompatTag(tagName) ?
      t.stringLiteral(tagName) :
      tagExpr;
  }


  function toMemberExpression(id) {
    return (
      id
        .split('.')
        .map(name => t.identifier(name))
        .reduce((object, property) => t.memberExpression(object, property))
    );
  }
};
