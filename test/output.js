/** @jsx test.createElement */

/** @jsxFrag test.Fragment */

/** @jsxInterpolation test.interpolation */
function Component({
  className,
  props,
  others
}) {
  return test.createElement``(test.Fragment, null, test.createElement("div", {
    id: "my-div",
    className: test.interpolation(test.interpolation(className))
  }, test.createElement(test.Fragment, null, test.createElement("span", null), "OK"), test.createElement("p", {
    color: test.interpolation(test.interpolation(color)),
    label: "f\"o",
    hidden: test.interpolation(test.interpolation(Math.random() < .5))
  })), test.createElement(Component, test.interpolation({
    id: "my-component",
    className: test.interpolation(test.interpolation(className)),
    ...props,
    ...others
  }), test.interpolation(test.interpolation([test.createElement``("p", {
    a: "a",
    b: test.interpolation(test.interpolation(Math.random() < .5))
  })]))));
}

function Interoplation() {
  const f1 = test.createElement``(test.Fragment, null, "A", test.interpolation(first), "B");
  const f2 = test.createElement``("div", null, "A", test.interpolation(second), "B");
}
