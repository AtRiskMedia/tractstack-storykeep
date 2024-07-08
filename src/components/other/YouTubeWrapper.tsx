import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

export const YouTubeWrapper = ({ title }: { title: string }) => {
  return <LiteYouTubeEmbed id={title} title={title} />;
};
