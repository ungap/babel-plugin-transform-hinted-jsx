import _pluginJSX from "@babel/plugin-transform-react-jsx";

// _pluginJSX.default when using native ESM;
// _pluginJSX when using the version compiled by ascjs.
const pluginJSX = _pluginJSX.default || _pluginJSX;

const JSX_ANNOTATION_REGEX = /\*?\s*@jsx\s+([^\s]+)/;
const JSX_FRAG_ANNOTATION_REGEX = /\*?\s*@jsxFrag\s+([^\s]+)/;
const JSX_INTERPOLATION_ANNOTATION_REGEX = /\*?\s*@jsxInterpolation\s+([^\s]+)/;

export default ({types: t}, options) => {
  let pragma = '', pragmaFrag = '', pragmaPrefix = '', pragmaInterplt = '';

  const injectedContainers = new WeakSet;

  const getCalleeName = ({object, property, name}) => {
    if (name) return name;
    const whole = [property.name];
    while (object.object) {
      whole.push(object.property.name);
      object = object.object;
    }
    whole.push(object.name);
    return whole.reverse().join('.');
  };

  const interpolation = () => (
    pragmaInterplt ||
    ((pragmaPrefix || 'React') + '.interpolation'))
  ;

  const interpolation2ME = () => toMemberExpression(
    interpolation(),
    'identifier',
    'memberExpression'
  );

  const fragment2ME = () => toMemberExpression(
    pragmaFrag || 'React.Fragment',
    'jsxIdentifier',
    'jsxMemberExpression'
  );

  const toMemberExpression = (id, identifier, memberExpression) => (
    id.split('.')
      .map(name => t[identifier](name))
      .reduce(
        (object, property) => t[memberExpression](object, property)
      )
  );

  // Force the JSX plugin to use object spread instead of _extends.
  options.useSpread = true;

  return {
    inherits: pluginJSX,
    visitor: {
      // intercepts comments directive to name pragma and utils
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
                pragmaInterplt = RegExp.$1;
            }
          }
        }
      },
      // add a unique token to outer most JSX templates
      JSXElement(path) {
        if (path.parentPath.isJSXElement()) return;

        const tokenId = path.scope.generateUidIdentifier("token");
        path.scope.getProgramParent().push({
          id: tokenId,
          init: t.objectExpression([])
        });

        const expr = t.jsxExpressionContainer(t.cloneNode(tokenId));
        injectedContainers.add(expr);

        path.node.openingElement.attributes.unshift(
          t.jsxAttribute(
            t.jsxIdentifier("__token"),
            expr
          )
        );
      },
      // augment interpolations with an explicit call
      // to its React.interpolation equivalent
      JSXExpressionContainer({node, parentPath}) {
        if (
          injectedContainers.has(node) ||
          (
            parentPath.isJSXAttribute() &&
            parentPath.parent.attributes.some(
              attr => t.isJSXSpreadAttribute(attr)
            )
          )
        ) return;

        injectedContainers.add(node);
        node.expression = t.callExpression(
          interpolation2ME(),
          [node.expression]
        );
      },
      // transform a fragment into a JSXExpressionContainer
      // where checks around its top most definition are performed
      JSXFragment(path) {
        path.replaceWith(
          t.jsxElement(
            t.jsxOpeningElement(
              fragment2ME(),
              []
            ),
            t.jsxClosingElement(
              fragment2ME(),
              []
            ),
            path.node.children
          )
        )
      },
      // makes spread operations around attributes pollute the whole
      // attributes handling as dynamic interpolation
      SpreadElement(path) {
        const {parentPath} = path.parentPath;
        if (parentPath && parentPath.isCallExpression()) {
          const name = getCalleeName(parentPath.node.callee);
          if (
            name === pragma ||
            name === 'React.createElement'
          ) {
            const {callee} = path.parentPath.node;
            if (callee && getCalleeName(callee) === interpolation())
              return;
            path.parentPath.replaceWith(
              t.inherits(
                t.callExpression(
                  interpolation2ME(),
                  [path.parentPath.node]
                ),
                path.parentPath
              )
            );
          }
        }
      }
    }
  };
};
