import React, { useState, useEffect } from 'react';

const Post = ({ location, description, startDate, endDate, thoughtfulMemories, privatePost, username, userId, createdAt, photoMemories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="w-full p-4 bg-white shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 border-2 border-amber-700">
      <div className="border-b-2 border-gray-200 pb-2 mb-4 flex justify-between items-center">
        <div className="text-xl font-semibold text-gray-800">
          {username}
        </div>
        <div className={`${privatePost ? "text-red-600" : "text-green-500"} font-medium text-md`}>
          {privatePost ? "Private" : "Public"}
        </div>
      </div>

      <div className="px-3 py-2">
        <h3 className="text-lg font-semibold text-gray-700">{location}</h3>
        <span className="text-sm text-gray-500">{startDate} - {endDate}</span>
        <div className="text-md font-normal py-2 text-gray-800">
          {description}
          <ul className="list-disc list-inside mt-2">
            {thoughtfulMemories?.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      </div>

      {photoMemories && photoMemories.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {photoMemories.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`Memory ${index + 1}`}
              className="w-full h-32 object-cover rounded cursor-zoom-in"
              onClick={() => {
                setPhotoIndex(index);
                setIsOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <div className="border-t-2 border-gray-200 pt-2 mt-4 flex justify-between items-center text-sm text-gray-500">
        <span>Posted on: {createdAt}</span>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={() => setIsOpen(false)}>
          <img
            src={photoMemories[photoIndex]}
            alt={`Memory ${photoIndex + 1}`}
            className="max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default Post;
