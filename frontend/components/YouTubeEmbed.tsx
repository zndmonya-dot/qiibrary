import { YouTubeVideo } from '@/lib/api';
import { formatNumber, formatRelativeTime } from '@/lib/utils';

interface YouTubeEmbedProps {
  video: YouTubeVideo;
}

export default function YouTubeEmbed({ video }: YouTubeEmbedProps) {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg p-4 border border-qiita-border dark:border-dark-border shadow-md hover:shadow-lg transition-shadow duration-150 h-full flex flex-col">
      {/* YouTube埋め込み */}
      <div className="aspect-video mb-4 rounded-lg overflow-hidden shadow-md border border-qiita-border dark:border-dark-border">
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
          className="font-bold mb-3 line-clamp-2 text-qiita-text-dark dark:text-white hover:text-youtube-red transition-colors duration-150 text-base leading-snug"
        >
          {video.title}
        </a>
        
        {/* チャンネル名 */}
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-qiita-border dark:border-dark-border">
          <div className="w-8 h-8 bg-youtube-red/10 dark:bg-youtube-red/20 rounded-full flex items-center justify-center">
            <i className="ri-youtube-fill text-youtube-red text-lg"></i>
          </div>
          <span className="text-sm text-qiita-text-dark dark:text-white font-semibold">{video.channel_name}</span>
        </div>
        
        {/* 統計情報 */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 bg-qiita-surface dark:bg-dark-surface-light px-3 py-1.5 rounded-full">
            <i className="ri-eye-line text-blue-500 text-sm"></i>
            <span className="text-xs text-qiita-text-dark dark:text-white font-semibold">{formatNumber(video.view_count)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-qiita-surface dark:bg-dark-surface-light px-3 py-1.5 rounded-full">
            <i className="ri-thumb-up-line text-youtube-red text-sm"></i>
            <span className="text-xs text-qiita-text-dark dark:text-white font-semibold">{formatNumber(video.like_count)}</span>
          </div>
        </div>
        
        {/* 視聴ボタン */}
        <div className="mt-auto">
          <a
            href={video.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-youtube w-full justify-center py-2.5"
          >
            <i className="ri-play-circle-line text-xl"></i>
            <span>YouTubeで視聴</span>
          </a>
        </div>
      </div>
    </div>
  );
}

