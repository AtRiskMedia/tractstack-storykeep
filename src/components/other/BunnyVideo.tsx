import { useRef, useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { storyFragmentBunnyWatch, contextBunnyWatch } from "../../store/events";

export const BunnyVideo = ({
  videoUrl,
  title,
  slug,
}: {
  videoUrl: string;
  title: string;
  slug: string;
}) => {
  const [startTime, setStartTime] = useState<number | null>(null);
  const $storyFragmentBunnyWatch = useStore(storyFragmentBunnyWatch);
  const $contextBunnyWatch = useStore(contextBunnyWatch);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // if t=?s is in urlParams, jump to play
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get(`t`);
    const regex = /^(\d+)s$/;
    const match = t?.match(regex);
    if (match && match[1]) {
      setStartTime(parseInt(match[1]));
      const targetDiv = document.getElementById(`bunny`);
      if (targetDiv) {
        targetDiv.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  useEffect(() => {
    if ($storyFragmentBunnyWatch?.slug === slug) {
      setStartTime($storyFragmentBunnyWatch.t);
      storyFragmentBunnyWatch.set(null);
    } else if ($contextBunnyWatch?.slug === slug) {
      setStartTime($contextBunnyWatch.t);
      contextBunnyWatch.set(null);
    }
    if (typeof startTime === `number` && iframeRef.current) {
      iframeRef.current.onload = () => {
        setTimeout(() => {
          if (iframeRef.current && iframeRef.current.contentDocument) {
            // iframe is loaded, now play the video (if autoplay)
            const video =
              iframeRef.current.contentDocument.querySelector("video");
            if (video) {
              video.play();
            }
          }
        }, 100); // wait for 100ms to ensure the iframe is fully loaded
      };
    }
  }, [
    startTime,
    iframeRef,
    slug,
    $storyFragmentBunnyWatch,
    $contextBunnyWatch,
  ]);

  return (
    <div className="relative aspect-video">
      <iframe
        id="bunny"
        ref={iframeRef}
        src={`${videoUrl}?autoplay=${typeof startTime === `number`}&loop=false&muted=false&preload=${typeof startTime === `number`}&responsive=true&t=${startTime || 0}`}
        title={title}
        loading="lazy"
        className="border-none absolute top-0 h-full w-full"
        allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
        allowFullScreen
      ></iframe>
    </div>
  );
};
