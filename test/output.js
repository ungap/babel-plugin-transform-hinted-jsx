var _token = {},
    _token2 = {};

/** @jsx a.b.c.d.createElement */

/** @jsxFrag a.b.c.d.Fragment */

/** @jsxInterpolation a.b.c.d.interpolation */
function Component({
  className,
  props,
  others
}) {
  return a.b.c.d.createElement(a.b.c.d.Fragment, {
    __token: _token
  }, a.b.c.d.createElement("div", {
    id: "my-div",
    className: a.b.c.d.interpolation(className)
  }, a.b.c.d.createElement(a.b.c.d.Fragment, null, a.b.c.d.createElement("span", null), "OK"), a.b.c.d.createElement("p", {
    color: a.b.c.d.interpolation(color),
    label: "f\"o",
    hidden: a.b.c.d.interpolation(Math.random() < .5)
  })), a.b.c.d.createElement(Component, a.b.c.d.interpolation({
    id: "my-component",
    className: className,
    ...props,
    ...others
  }), a.b.c.d.interpolation([a.b.c.d.createElement("p", {
    __token: _token2,
    a: "a",
    b: a.b.c.d.interpolation(Math.random() < .5)
  })])));
}
