import { YouTubeVideo } from '@/lib/api';
import { formatNumber, formatRelativeTime } from '@/lib/utils';

interface YouTubeEmbedProps {
  video: YouTubeVideo;
}

export default function YouTubeEmbed({ video }: YouTubeEmbedProps) {
  return (
    <div className="card-youtube border border-transparent hover:border-youtube-dark-text-secondary/20 transition-all duration-200 h-full flex flex-col">
      {/* YouTube埋め込み */}
      <div className="aspect-video mb-4 rounded-lg overflow-hidden border border-youtube-dark-surface shadow-lg">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${video.video_id}`}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
      
      {/* 動画情報 */}
      <div className="flex-1 flex flex-col">
        <a
          href={video.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold mb-3 line-clamp-2 hover:text-youtube-red transition-colors duration-200 text-base"
        >
          {video.title}
        </a>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-secondary mb-4">
          <div className="flex items-center gap-1.5">
            <i className="ri-user-line text-youtube-red"></i>
            <span>{video.channel_name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <i className="ri-eye-line text-blue-400"></i>
            <span>{formatNumber(video.view_count)}回</span>
          </div>
          <div className="flex items-center gap-1.5">
            <i className="ri-thumb-up-line text-youtube-red"></i>
            <span>{formatNumber(video.like_count)}</span>
          </div>
        </div>
        
        <div className="mt-auto">
          <a
            href={video.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-youtube-red hover:bg-youtube-red hover:text-white px-4 py-2 rounded border border-youtube-red text-sm font-medium transition-all duration-200"
          >
            <i className="ri-youtube-line text-lg"></i>
            <span>YouTubeで視聴</span>
          </a>
        </div>
      </div>
    </div>
  );
}

