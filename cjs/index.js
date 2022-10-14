'use strict';
module.exports = ({types: t}) => {
  return {
    visitor: {
      JSXExpressionContainer,
      JSXElement(path) {
        // just return to see above message logged
        // return;
        if (!path.parentPath.isJSX() && !path.parentPath.isCallExpression()) {
          const openingPath = path.get('openingElement');
          for (const node of path.node.children) {
            if (node.type === 'JSXExpressionContainer')
              JSXExpressionContainer({node});
          }
          const callExpr = t.callExpression(
            toMemberExpression('React.createElement``'),
            [
              getTag(openingPath),
              t.nullLiteral(),
              ...t.react.buildChildren(path.node),
            ]
          );
          path.replaceWith(t.inherits(callExpr, path.node));
        }
      }
    }
  };

  function JSXExpressionContainer(path) {
    const {expression} = path.node;
    path.node.expression = t.callExpression(
      toMemberExpression('React.interpolation'),
      [expression]
    );
  }
  /*!
   * (c) Babel Project - MIT License
   * The following code has been taken and slightly readapted from
   * https://github.com/babel/babel/blob/0058b7fef4d028d2826645b28e3b448517cd979d/packages/babel-plugin-transform-react-jsx/src/create-plugin.ts
   */

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
