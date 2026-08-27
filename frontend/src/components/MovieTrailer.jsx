import React from 'react';

const MovieTrailer = ({ videos }) => {
    // Find the YouTube trailer from the passed prop
    const trailer = videos?.results?.find(
        vid => vid.site === "YouTube" && (vid.type === "Trailer" || vid.type === "Teaser")
    );

    if (!trailer) return null;

    return (
        <div className="">
            <h2 className="text-xl font-bold text-white tracking-tight border-l-4 border-brand-primary pl-4">Trailer: </h2>
            <div className="aspect-video w-full mt-2 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${trailer.key}`}
                    title="Movie Trailer"
                    allowFullScreen
                    className="w-full h-full"
                ></iframe>
            </div>
        </div>
    );
};

export default MovieTrailer;