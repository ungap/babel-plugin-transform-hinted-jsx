/** @jsx a.b.c.d.createElement */
/** @jsxFrag a.b.c.d.Fragment */
/** @jsxInterpolation a.b.c.d.interpolation */

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
