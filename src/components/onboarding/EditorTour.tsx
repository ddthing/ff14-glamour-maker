// Lucian UX/UI Prompt #197 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#197
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import './EditorTour.css';

export interface EditorTourProps {
  onStart?: () => void;
  onStepChange?: (index: number) => void;
  onFinish?: () => void;
}

const STEPS = [
  { selector: '[data-tour="photo"]', title: 'tour.steps.photo.title', description: 'tour.steps.photo.description' },
  { selector: '[data-tour="slots"]', title: 'tour.steps.slots.title', description: 'tour.steps.slots.description' },
  { selector: '[data-tour="search"]', title: 'tour.steps.search.title', description: 'tour.steps.search.description' },
  { selector: '[data-tour="settings"]', title: 'tour.steps.settings.title', description: 'tour.steps.settings.description' },
  { selector: '[data-tour="export"]', title: 'tour.steps.export.title', description: 'tour.steps.export.description' },
] as const;

const SPOTLIGHT_PADDING = 6;
const TARGET_WAIT_FRAMES = 90;
const HEADER_OFFSET = 64;
const TIP_HEIGHT_ESTIMATE = 152;
const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

interface Viewport {
  width: number;
  height: number;
}

interface SpotlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type TipSide = 'dn' | 'up' | 'rt' | 'lt';

interface TipPosition extends CSSProperties {
  left: string;
  top: string;
  width: string;
  '--ax': string;
  '--ay': string;
}

function getViewport(): Viewport {
  return { width: window.innerWidth, height: window.innerHeight };
}

function isVisible(element: HTMLElement): boolean {
  if (!element.isConnected) return false;

  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') return false;

  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && element.getClientRects().length > 0;
}

function canRestoreFocus(element: HTMLElement): boolean {
  if (!element.isConnected || element === document.body || element === document.documentElement || element.closest('[inert]')) {
    return false;
  }

  const style = window.getComputedStyle(element);
  return element.tabIndex >= 0
    && style.display !== 'none'
    && style.visibility !== 'hidden'
    && style.visibility !== 'collapse';
}

function getSpotlightRect(element: HTMLElement, viewport: Viewport): SpotlightRect | null {
  const target = element.getBoundingClientRect();
  const left = Math.max(0, Math.min(viewport.width, target.left - SPOTLIGHT_PADDING));
  const top = Math.max(0, Math.min(viewport.height, target.top - SPOTLIGHT_PADDING));
  const right = Math.max(left, Math.min(viewport.width, target.right + SPOTLIGHT_PADDING));
  const bottom = Math.max(top, Math.min(viewport.height, target.bottom + SPOTLIGHT_PADDING));

  if (right <= left || bottom <= top) return null;
  return { x: left, y: top, width: right - left, height: bottom - top };
}

function spotlightPath(rect: SpotlightRect | null, viewport: Viewport): string {
  const { width, height } = viewport;
  if (!rect) return `M0 0H${width}V${height}H0Z`;

  const radius = Math.min(14, rect.height / 2, rect.width / 2);
  const { x, y } = rect;
  const right = x + rect.width;
  const bottom = y + rect.height;

  return `M0 0H${width}V${height}H0Z M${x + radius} ${y}H${right - radius}Q${right} ${y} ${right} ${y + radius}V${bottom - radius}Q${right} ${bottom} ${right - radius} ${bottom}H${x + radius}Q${x} ${bottom} ${x} ${bottom - radius}V${y + radius}Q${x} ${y} ${x + radius} ${y}Z`;
}

function scrollTargetIntoView(target: HTMLElement, reduceMotion: boolean, viewport: Viewport, tipHeight: number): void {
  const bounds = target.getBoundingClientRect();
  const alignedAtStart = bounds.height + 2 * (tipHeight + 12) > viewport.height - 20;
  const previousScrollMargin = target.style.scrollMarginTop;
  if (alignedAtStart) target.style.scrollMarginTop = `${HEADER_OFFSET}px`;

  try {
    target.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'instant',
      block: alignedAtStart ? 'start' : 'center',
      inline: 'nearest',
    });
  } catch {
    target.scrollIntoView();
  } finally {
    target.style.scrollMarginTop = previousScrollMargin;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function sameRect(first: SpotlightRect | null, second: SpotlightRect): boolean {
  if (!first) return false;
  return Math.abs(first.x - second.x) < 0.5
    && Math.abs(first.y - second.y) < 0.5
    && Math.abs(first.width - second.width) < 0.5
    && Math.abs(first.height - second.height) < 0.5;
}

export function EditorTour({ onStart, onStepChange, onFinish }: EditorTourProps) {
  const { t, i18n } = useTranslation();
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetMissing, setTargetMissing] = useState(false);
  const [hasTarget, setHasTarget] = useState(false);
  const [tipPlaced, setTipPlaced] = useState(false);
  const [tipSide, setTipSide] = useState<TipSide>('dn');
  const [viewport, setViewport] = useState<Viewport>({ width: 0, height: 0 });
  const [tipPosition, setTipPosition] = useState<TipPosition>({
    left: '12px',
    top: '12px',
    width: '224px',
    '--ax': '30px',
    '--ay': '30px',
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const holeRef = useRef<SpotlightRect | null>(null);
  const destinationRef = useRef<SpotlightRect | null>(null);
  const stepIndexRef = useRef(stepIndex);
  const activeRef = useRef(active);
  const reducedMotionRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const positionFrameRef = useRef<number | null>(null);
  const repositionRef = useRef<() => void>(() => undefined);
  const navigateRef = useRef<(index: number) => void>(() => undefined);
  const finishRef = useRef<() => void>(() => undefined);
  const callbackRef = useRef({ onStart, onStepChange, onFinish });

  const paintHole = useCallback((rect: SpotlightRect | null) => {
    const currentViewport = getViewport();
    pathRef.current?.setAttribute('d', spotlightPath(rect, currentViewport));

    const ring = ringRef.current;
    if (!ring || !rect) return;

    ring.style.transform = `translate(${rect.x.toFixed(1)}px,${rect.y.toFixed(1)}px)`;
    ring.style.width = `${rect.width.toFixed(1)}px`;
    ring.style.height = `${rect.height.toFixed(1)}px`;
    ring.style.borderRadius = `${Math.min(14, rect.height / 2)}px`;
  }, []);

  const setDialogRef = useCallback((element: HTMLDivElement | null) => {
    dialogRef.current = element;
    tipRef.current = element;
  }, []);

  const positionTip = useCallback((rect: SpotlightRect | null) => {
    const tip = tipRef.current;
    const { width: viewportWidth, height: viewportHeight } = getViewport();
    const width = Math.max(0, Math.min(224, viewportWidth - 24));

    if (!tip) {
      setTipPosition(previous => ({ ...previous, width: `${width}px` }));
      return;
    }

    tip.style.width = `${width}px`;
    const tipRect = tip.getBoundingClientRect();
    const tipWidth = tipRect.width || width;
    const tipHeight = tipRect.height || 148;
    const margin = 10;
    const gap = 12;

    if (!rect) {
      setTipSide('dn');
      setTipPosition({
        left: `${clamp((viewportWidth - tipWidth) / 2, margin, viewportWidth - tipWidth - margin)}px`,
        top: `${clamp((viewportHeight - tipHeight) / 2, margin, viewportHeight - tipHeight - margin)}px`,
        width: `${width}px`,
        '--ax': `${tipWidth / 2}px`,
        '--ay': `${tipHeight / 2}px`,
      });
      setTipPlaced(true);
      return;
    }

    const candidates: Array<{ side: TipSide; left: number; top: number; fits: boolean; room: number }> = [
      {
        side: 'dn',
        left: clamp(rect.x + rect.width / 2 - tipWidth / 2, margin, viewportWidth - tipWidth - margin),
        top: rect.y + rect.height + gap,
        fits: rect.y + rect.height + gap + tipHeight <= viewportHeight - margin,
        room: viewportHeight - (rect.y + rect.height + gap),
      },
      {
        side: 'up',
        left: clamp(rect.x + rect.width / 2 - tipWidth / 2, margin, viewportWidth - tipWidth - margin),
        top: rect.y - gap - tipHeight,
        fits: rect.y - gap - tipHeight >= margin,
        room: rect.y - gap,
      },
      {
        side: 'rt',
        left: rect.x + rect.width + gap,
        top: clamp(rect.y + rect.height / 2 - tipHeight / 2, margin, viewportHeight - tipHeight - margin),
        fits: rect.x + rect.width + gap + tipWidth <= viewportWidth - margin,
        room: viewportWidth - (rect.x + rect.width + gap),
      },
      {
        side: 'lt',
        left: rect.x - gap - tipWidth,
        top: clamp(rect.y + rect.height / 2 - tipHeight / 2, margin, viewportHeight - tipHeight - margin),
        fits: rect.x - gap - tipWidth >= margin,
        room: rect.x - gap,
      },
    ];
    const placement = candidates.find(candidate => candidate.fits)
      ?? candidates.reduce((best, candidate) => candidate.room > best.room ? candidate : best);
    const left = clamp(placement.left, margin, viewportWidth - tipWidth - margin);
    const top = clamp(placement.top, margin, viewportHeight - tipHeight - margin);
    const anchorX = clamp(rect.x + rect.width / 2 - left, 18, tipWidth - 18);
    const anchorY = clamp(rect.y + rect.height / 2 - top, 16, tipHeight - 16);

    setTipSide(placement.side);
    setTipPosition({
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      '--ax': `${anchorX}px`,
      '--ay': `${anchorY}px`,
    });
    setTipPlaced(true);
  }, []);

  const moveHole = useCallback((to: SpotlightRect) => {
    if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current);
    const from = holeRef.current ?? { x: to.x + to.width / 2, y: to.y + to.height / 2, width: 0, height: 0 };
    destinationRef.current = to;
    const startTime = performance.now();

    const frame = (now: number) => {
      const progress = reducedMotionRef.current ? 1 : Math.max(0, Math.min(1, (now - startTime) / 520));
      const curve = 1.4;
      const eased = 1 + (curve + 1) * Math.pow(progress - 1, 3) + curve * Math.pow(progress - 1, 2);
      const current: SpotlightRect = {
        x: from.x + (to.x - from.x) * eased,
        y: from.y + (to.y - from.y) * eased,
        width: Math.max(0, from.width + (to.width - from.width) * eased),
        height: Math.max(0, from.height + (to.height - from.height) * eased),
      };

      holeRef.current = current;
      paintHole(current);
      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(frame);
      } else {
        animationFrameRef.current = null;
      }
    };

    frame(startTime);
  }, [paintHole]);

  const reposition = useCallback(() => {
    const target = targetRef.current;
    if (!target) return;
    if (!isVisible(target)) {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setHasTarget(false);
      holeRef.current = null;
      destinationRef.current = null;
      paintHole(null);
      positionTip(null);
      return;
    }

    const rect = getSpotlightRect(target, getViewport());
    if (!rect) {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setHasTarget(false);
      holeRef.current = null;
      destinationRef.current = null;
      paintHole(null);
      positionTip(null);
      return;
    }

    if (sameRect(destinationRef.current, rect)) return;

    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    holeRef.current = rect;
    destinationRef.current = rect;
    setHasTarget(true);
    paintHole(rect);
    positionTip(rect);
  }, [paintHole, positionTip]);

  const navigate = useCallback((nextIndex: number) => {
    if (!activeRef.current || nextIndex < 0 || nextIndex >= STEPS.length) return;
    targetRef.current = null;
    setTargetMissing(false);
    setHasTarget(false);
    setStepIndex(nextIndex);
    stepIndexRef.current = nextIndex;
    callbackRef.current.onStepChange?.(nextIndex);
  }, []);

  const finishTour = useCallback(() => {
    if (!activeRef.current) return;
    setActive(false);
    activeRef.current = false;
    targetRef.current = null;
    setTargetMissing(false);
    setHasTarget(false);
    setTipPlaced(false);
    holeRef.current = null;
    destinationRef.current = null;
    callbackRef.current.onFinish?.();
  }, []);

  useLayoutEffect(() => {
    callbackRef.current = { onStart, onStepChange, onFinish };
    stepIndexRef.current = stepIndex;
    activeRef.current = active;
    repositionRef.current = reposition;
    navigateRef.current = navigate;
    finishRef.current = finishTour;
  }, [active, finishTour, navigate, onFinish, onStart, onStepChange, reposition, stepIndex]);

  const startTour = () => {
    if (activeRef.current) return;
    const focusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    returnFocusRef.current = focusedElement && canRestoreFocus(focusedElement) ? focusedElement : triggerRef.current;
    holeRef.current = null;
    destinationRef.current = null;
    targetRef.current = null;
    setTargetMissing(false);
    setHasTarget(false);
    setTipPlaced(false);
    setStepIndex(0);
    stepIndexRef.current = 0;
    setActive(true);
    activeRef.current = true;
    callbackRef.current.onStart?.();
    callbackRef.current.onStepChange?.(0);
  };

  useLayoutEffect(() => {
    if (!active) return undefined;

    const appRoot = document.getElementById('root')
      ?? Array.from(document.body.children).find(child => child.contains(triggerRef.current)) as HTMLElement | undefined;
    const wasInert = appRoot?.inert ?? false;
    if (appRoot) appRoot.inert = true;

    const mediaQuery = window.matchMedia?.(reducedMotionQuery);
    reducedMotionRef.current = mediaQuery?.matches ?? false;
    const handleMotionChange = (event: MediaQueryListEvent | MediaQueryList) => {
      reducedMotionRef.current = event.matches;
      if (event.matches) repositionRef.current();
    };
    mediaQuery?.addEventListener?.('change', handleMotionChange);
    if (mediaQuery && !mediaQuery.addEventListener) mediaQuery.addListener(handleMotionChange);

    nextRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && !event.altKey && (key === 'z' || key === 'y')) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        finishRef.current();
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        event.stopPropagation();
        if (stepIndexRef.current === STEPS.length - 1) finishRef.current();
        else navigateRef.current(stepIndexRef.current + 1);
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        event.stopPropagation();
        navigateRef.current(stepIndexRef.current - 1);
        return;
      }
      if (event.key === 'Tab') {
        const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]):not([hidden]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? []).filter(element => element.getAttribute('aria-hidden') !== 'true'
          && window.getComputedStyle(element).visibility !== 'hidden');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) {
          event.preventDefault();
          event.stopPropagation();
        } else if (!dialogRef.current?.contains(document.activeElement)) {
          event.preventDefault();
          event.stopPropagation();
          (event.shiftKey ? last : first).focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          event.stopPropagation();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          event.stopPropagation();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      mediaQuery?.removeEventListener?.('change', handleMotionChange);
      if (mediaQuery && !mediaQuery.removeEventListener) mediaQuery.removeListener(handleMotionChange);
      if (appRoot) appRoot.inert = wasInert;
      if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current);
      if (positionFrameRef.current !== null) window.cancelAnimationFrame(positionFrameRef.current);
      if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus({ preventScroll: true });
      returnFocusRef.current = null;
    };
  }, [active]);

  useLayoutEffect(() => {
    if (!active) return undefined;

    const updateViewport = () => {
      const nextViewport = getViewport();
      setViewport(nextViewport);
    };
    const scheduleReposition = () => {
      if (positionFrameRef.current !== null) return;
      positionFrameRef.current = window.requestAnimationFrame(() => {
        positionFrameRef.current = null;
        repositionRef.current();
      });
    };
    const handleResize = () => {
      updateViewport();
      scheduleReposition();
    };
    updateViewport();
    paintHole(null);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', scheduleReposition, true);
    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', scheduleReposition);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', scheduleReposition, true);
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', scheduleReposition);
      if (positionFrameRef.current !== null) {
        window.cancelAnimationFrame(positionFrameRef.current);
        positionFrameRef.current = null;
      }
    };
  }, [active, paintHole]);

  useEffect(() => {
    if (!active) return undefined;

    let cancelled = false;
    let frameCount = 0;
    let frameId = 0;
    const selector = STEPS[stepIndex].selector;
    targetRef.current = null;
    setTargetMissing(false);
    setHasTarget(false);
    const markUnavailable = () => {
      if (cancelled) return;
      targetRef.current = null;
      setTargetMissing(true);
      setHasTarget(false);
      holeRef.current = null;
      destinationRef.current = null;
      paintHole(null);
      positionTip(null);
      nextRef.current?.focus({ preventScroll: true });
    };

    const findTarget = () => {
      if (cancelled || !activeRef.current || stepIndexRef.current !== stepIndex) return;
      const candidate = document.querySelector<HTMLElement>(selector);
      if (candidate && isVisible(candidate)) {
        targetRef.current = candidate;
        scrollTargetIntoView(
          candidate,
          reducedMotionRef.current,
          getViewport(),
          tipRef.current?.getBoundingClientRect().height || TIP_HEIGHT_ESTIMATE,
        );
        frameId = window.requestAnimationFrame(() => {
          if (cancelled || targetRef.current !== candidate) return;
          const rect = getSpotlightRect(candidate, getViewport());
          if (rect) {
            setTargetMissing(false);
            setHasTarget(true);
            moveHole(rect);
            positionTip(rect);
          } else {
            markUnavailable();
          }
          nextRef.current?.focus({ preventScroll: true });
        });
        return;
      }

      frameCount += 1;
      if (frameCount >= TARGET_WAIT_FRAMES) {
        markUnavailable();
      } else {
        frameId = window.requestAnimationFrame(findTarget);
      }
    };

    frameId = window.requestAnimationFrame(findTarget);
    return () => {
      cancelled = true;
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [active, stepIndex, moveHole, paintHole, positionTip]);

  useEffect(() => {
    if (!active) return undefined;
    const target = targetRef.current;
    if (!target) return undefined;

    const scheduleReposition = () => {
      if (positionFrameRef.current !== null) return;
      positionFrameRef.current = window.requestAnimationFrame(() => {
        positionFrameRef.current = null;
        repositionRef.current();
      });
    };
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleReposition);
    observer?.observe(target);

    return () => observer?.disconnect();
  }, [active, stepIndex, hasTarget]);

  useLayoutEffect(() => {
    if (!active) return;
    const target = targetRef.current;
    if (target && isVisible(target)) positionTip(getSpotlightRect(target, getViewport()));
    else if (targetMissing) positionTip(null);
  }, [active, stepIndex, targetMissing, i18n.resolvedLanguage, positionTip]);

  // The tooltip is hidden until its target is measured. Focus only after
  // React commits that visible state, rather than during the measuring frame.
  useLayoutEffect(() => {
    if (active && (hasTarget || targetMissing)) {
      nextRef.current?.focus({ preventScroll: true });
    }
  }, [active, hasTarget, targetMissing, stepIndex]);

  const currentStep = STEPS[stepIndex];
  const tipStyle = tipPosition;
  const overlay = active && typeof document !== 'undefined'
    ? createPortal(
      <div
        className="ux u197 is-tour"
        data-has-target={hasTarget ? 'true' : 'false'}
        data-target-pending={!targetMissing && !tipPlaced ? 'true' : 'false'}
      >
        <div className="u197-shield" aria-hidden="true" />
        <svg
          className="u197-ov"
          viewBox={`0 0 ${viewport.width} ${viewport.height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path ref={pathRef} fill="rgba(10,12,22,.66)" fillRule="evenodd" d="" />
        </svg>
        <div className="u197-ring" ref={ringRef} aria-hidden="true" />
        <div
          className={`u197-tip ${tipSide}`}
          ref={setDialogRef}
          style={tipStyle}
          role="dialog"
          aria-modal="true"
          aria-label={t('tour.dialog_label')}
          aria-describedby="u197-step-status u197-description"
          data-step={stepIndex + 1}
        >
          <button className="u197-x" type="button" onClick={finishTour}>
            {t('tour.skip')}
          </button>
          <div className="ct" key={stepIndex}>
            <small id="u197-step-status" aria-live="polite" aria-atomic="true">
              {t('tour.step_status', { current: stepIndex + 1, total: STEPS.length })}
            </small>
            <h2 id="u197-heading">{t(currentStep.title)}</h2>
            <p id="u197-description">{targetMissing ? t('tour.unavailable') : t(currentStep.description)}</p>
          </div>
          <div className="u197-tf">
            <span className="u197-dots" aria-hidden="true">
              {STEPS.map((step, index) => <i className={index === stepIndex ? 'on' : undefined} key={step.selector} />)}
            </span>
            <button className="u197-pv" type="button" hidden={stepIndex === 0} onClick={() => navigate(stepIndex - 1)}>
              {t('tour.previous')}
            </button>
            <button
              className="u197-nx"
              type="button"
              ref={nextRef}
              onClick={() => stepIndex === STEPS.length - 1 ? finishTour() : navigate(stepIndex + 1)}
            >
              {stepIndex === STEPS.length - 1 ? t('tour.finish') : t('tour.next')}
            </button>
          </div>
        </div>
      </div>,
      document.body,
    )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        className="u197-help-trigger"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={active}
        onClick={startTour}
      >
        {t('tour.start')}
      </button>
      {overlay}
    </>
  );
}
