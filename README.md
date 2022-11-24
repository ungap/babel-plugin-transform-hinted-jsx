# @ungap/babel-plugin-transform-hinted-jsx

## Highly Experimental

If you are using this already, consider changes soon due [the discussion around current ESX proposal](https://es.discourse.group/t/proposal-esx-as-core-js-feature/1511/43).

Feel free to keep an eye on [udomsay](https://github.com/WebReflection/udomsay) as that will be the implementation reference for consumers.

- - -

This plugin is [a follow up of this post](https://webreflection.medium.com/jsx-is-inefficient-by-default-but-d1122c992399) and it can be used in place of [@babel/plugin-transform-react-jsx](https://www.npmjs.com/package/@babel/plugin-transform-react-jsx).

A huge thanks to [Nicolò Ribaudo](https://twitter.com/NicoloRibaudo) for helping out.

### babel.config.json

```json
{
  "plugins": [
    ["@ungap/babel-plugin-transform-hinted-jsx"]
  ]
}
```

### npm install

```sh
npm i --save-dev @babel/cli
npm i --save-dev @babel/core
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
var _token = {},
    _token2 = {};

const div = React.createElement(
  "div",
  {__token: _token},
  React.createElement(
    "p",
    {
      className: "static",
      runtime: React.interpolation('prop')
    }
  ),
  React.interpolation(
    React.createElement(
      "p",
      {__token: _token2}
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
