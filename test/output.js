function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

/** @jsx test.createElement */

/** @jsxFrag test.Fragment */

/** @jsxInterpolation test.Interpolation */
function Component({
  className,
  props
}) {
  return test.createElement``(test.Fragment, null, test.createElement("div", {
    id: "my-div",
    className: test.Interpolation(className)
  }, test.createElement(test.Fragment, null, test.createElement("span", null), "OK"), test.createElement("p", {
    color: test.Interpolation(color),
    label: "f\"o",
    hidden: test.Interpolation(Math.random() < .5)
  })), test.createElement(Component, _extends({
    id: "my-component",
    className: test.Interpolation(className)
  }, props), test.Interpolation([test.createElement``("p", {
    a: "a",
    b: test.Interpolation(Math.random() < .5)
  })])));
}
