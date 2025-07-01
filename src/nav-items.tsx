
import { HomeIcon, VideoIcon, BookmarkIcon } from "lucide-react";
import Index from "./pages/Index";
import VideoGenerator from "./pages/VideoGenerator";
import SavedVideos from "./pages/SavedVideos";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Create Video",
    to: "/crear-video",
    icon: <VideoIcon className="h-4 w-4" />,
    page: <VideoGenerator />,
  },
  {
    title: "Saved Videos",
    to: "/videos-guardados",
    icon: <BookmarkIcon className="h-4 w-4" />,
    page: <SavedVideos />,
  },
];
