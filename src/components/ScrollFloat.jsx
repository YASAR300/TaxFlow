'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollFloat = ({
  children,
  scrollContainerRef,
  animationDuration = 1,
  ease = 'back.inOut(2)',
  scrollStart = 'center bottom+=20%',
  scrollEnd = 'bottom bottom-=20%',
  stagger = 0.03,
  className = '',
  containerClassName = '',
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller = scrollContainerRef?.current || undefined;

    const chars = el.querySelectorAll('.scroll-float-char');
    if (!chars.length) return;

    gsap.fromTo(
      chars,
      { y: 80, opacity: 0, rotateX: -90 },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: animationDuration,
        ease,
        stagger,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: scrollStart,
          end: scrollEnd,
          scrub: true,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill();
      });
    };
  }, [animationDuration, ease, scrollStart, scrollEnd, stagger, scrollContainerRef]);

  const text = typeof children === 'string' ? children : '';
  const words = text.split(' ');

  return (
    <span
      ref={containerRef}
      className={`scroll-float-container ${containerClassName}`}
      style={{ display: 'inline-block', perspective: '1000px' }}
    >
      {words.map((word, wi) => (
        <span
          key={wi}
          className={`scroll-float-word ${className}`}
          style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}
        >
          {word.split('').map((char, ci) => (
            <span
              key={ci}
              className="scroll-float-char"
              style={{ display: 'inline-block', transformOrigin: '50% 0%' }}
            >
              {char}
            </span>
          ))}
          {wi < words.length - 1 && (
            <span className="scroll-float-char" style={{ display: 'inline-block' }}>
              &nbsp;
            </span>
          )}
        </span>
      ))}
    </span>
  );
};

export default ScrollFloat;
