/** @jsx test.createElement *//** @jsxFrag test.Fragment *//** @jsxInterpolation test.interpolation */

function Component({ className, props, others }) {
  return (
    <>
      <div id="my-div" className={className}>
        <>
          <span />
          OK
        </>
        <p color={color} label="f&quot;o" hidden={Math.random() < .5} />
      </div>
      <Component id="my-component" className={className} {...props} {...others}>
        {[<p a="a" b={Math.random() < .5} />]}
      </Component>
    </>
  );
}

function Interoplation() {
  const f1 = (
    <>
      A
      {first}
      B
    </>
  );

  const f2 = (
    <div>
      A
      {second}
      B
    </div>
  );
}
