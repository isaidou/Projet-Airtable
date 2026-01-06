import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, MessageCircle } from "lucide-react";

export default function ProjectCard({ 
    project, 
    onClick, 
    onLike, 
    onPublish, 
    published, 
    hasAlreadyLiked
}) {
    const { isAdmin } = useAuth();

    const imageUrl = project.image && project.image[0] && project.image[0].url;
    const likesCount = Array.isArray(project.likes) ? project.likes.length : 0;
    const commentsCount = Array.isArray(project.commentsDetails) ? project.commentsDetails.length : 0;

    return (
        <div
            className={`group cursor-pointer ${!published ? 'opacity-50' : ''}`}
            onClick={onClick}
        >
            <div className="relative w-full bg-slate-100 rounded-lg overflow-hidden mb-2 aspect-[4/3]">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={project.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                        <span className="text-slate-400 text-sm font-medium">{project.name}</span>
                    </div>
                )}
                
                {isAdmin && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPublish && onPublish();
                                }}
                                className="px-4 py-2 bg-white text-slate-900 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors"
                            >
                                {published ? 'Cacher' : 'Publier'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-start justify-between gap-4 pt-1.5">
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-slate-900 truncate">
                        {project.name}
                    </h3>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                    {!isAdmin && onLike ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onLike();
                            }}
                            className={`flex items-center gap-1.5 transition-all hover:scale-110 active:scale-95 ${
                                hasAlreadyLiked 
                                    ? 'text-slate-900' 
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
                            title={hasAlreadyLiked ? "Je n'aime plus" : "J'aime"}
                            type="button"
                        >
                            <Heart 
                                size={18} 
                                className={hasAlreadyLiked ? 'fill-slate-900 text-slate-900' : ''}
                            />
                            <span className="text-sm font-medium">{likesCount}</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <Heart size={18} />
                            <span className="text-sm font-medium">{likesCount}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 text-slate-500">
                        <MessageCircle size={18} />
                        <span className="text-sm font-medium">{commentsCount}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
