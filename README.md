# @ungap/babel-plugin-transform-hinted-jsx

This plugin is [a follow up of this post](https://webreflection.medium.com/jsx-is-inefficient-by-default-but-d1122c992399) and it can be used together with [@babel/plugin-transform-react-jsx](https://www.npmjs.com/package/@babel/plugin-transform-react-jsx).

A huge thanks to [Nicolò Ribaudo](https://twitter.com/NicoloRibaudo) for helping out.

### babel.config.json

```json
{
  "plugins": [
    ["@babel/plugin-transform-react-jsx", {"useSpread": true}],
    ["@ungap/babel-plugin-transform-hinted-jsx"]
  ]
}
```

### npm install

```sh
npm i --save-dev @babel/cli
npm i --save-dev @babel/core
npm i --save-dev @babel/plugin-transform-react-jsx
npm i --save-dev @ungap/plugin-transform-hinted-jsx
```

### What is it / How to use it

This produces a slightly different *JSX* transform.

```js
const div = (
  <div>
    <p className="static" runtime={'prop'}/>
    {<p />}
  </div>
);

// becomes
const div = React.createElement``(
  'div',
  null,
  React.createElement(
    'p',
    {
      className: 'static',
      runtime: React.interpolation('prop')
    }
  ),
  React.interpolation(
    React.createElement``(
      'p',
      null
    )
  )
);
```

### How to hint interpolations

```js
/** @jsx your.createElement */
/** @jsxFrag your.Fragment */
/** @jsxInterpolation your.interpolation */
```
