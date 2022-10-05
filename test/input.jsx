/** @jsx test.createElement *//** @jsxFrag test.Fragment *//** @jsxInterpolation test.Interpolation */

function Component({ className, props }) {
  return (
    <>
      <div id="my-div" className={className}>
        <>
          <span />
          OK
        </>
        <p color={color} label="f&quot;o" hidden={Math.random() < .5} />
      </div>
      <Component id="my-component" className={className} {...props}>
        {[<p a="a" b={Math.random() < .5} />]}
      </Component>
    </>
  );
}
