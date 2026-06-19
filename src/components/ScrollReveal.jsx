'use client';
import { useEffect, useRef } from 'react';

const ScrollReveal = ({
  children,
  enableBlur = true,
  baseOpacity = 0,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  rotationEnd = 'bottom bottom',
  wordAnimationEnd = 'bottom bottom',
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Lazy-load GSAP so it only runs client-side (Next.js safe)
    let ctx;
    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        const el = containerRef.current;
        if (!el) return;

        const words = el.querySelectorAll('.sr-word');
        if (!words.length) return;

        ctx = gsap.context(() => {
          // Rotate the whole container in on scroll
          gsap.fromTo(
            el,
            { transformOrigin: '0% 50%', rotateX: baseRotation },
            {
              rotateX: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                end: rotationEnd,
                scrub: true,
              },
            }
          );

          // Reveal each word
          words.forEach((word) => {
            const delay = parseFloat(word.dataset.delay || '0');

            gsap.fromTo(
              word,
              {
                opacity: baseOpacity,
                filter: enableBlur ? `blur(${blurStrength}px)` : 'none',
              },
              {
                opacity: 1,
                filter: 'blur(0px)',
                ease: 'none',
                delay,
                scrollTrigger: {
                  trigger: el,
                  start: 'top bottom-=10%',
                  end: wordAnimationEnd,
                  scrub: true,
                },
              }
            );
          });
        }, el);
      });
    });

    return () => ctx?.revert();
  }, [baseOpacity, baseRotation, blurStrength, enableBlur, rotationEnd, wordAnimationEnd]);

  const text = typeof children === 'string' ? children : '';
  const words = text.split(/(\s+)/);

  return (
    <div
      ref={containerRef}
      className={`scroll-reveal-container ${containerClassName}`}
      style={{ perspective: '1000px' }}
    >
      <p
        className={`scroll-reveal-text ${textClassName}`}
        style={{ display: 'flex', flexWrap: 'wrap', gap: '0 0.25em' }}
      >
        {words.map((word, i) => {
          if (/^\s+$/.test(word)) return null;
          return (
            <span
              key={i}
              className={`sr-word ${textClassName}`}
              data-delay={i * 0.01}
              style={{ display: 'inline-block', willChange: 'opacity, filter' }}
            >
              {word}
            </span>
          );
        })}
      </p>
    </div>
  );
};

export default ScrollReveal;
