function ThumbnailSkeleton({ recommended, noProfile, search }) {
    // Search video thumbnail
    if(search) {
      return (
        <div className="flex space-x-3 md:space-x-4 cursor-pointer">
          <div 
            className="flex-1 aspect-[16/9] animated-bg max-w-[180px] 
            md:max-w-[360px] flex-shrink-0"
          ></div>
          <div className="flex-1 flex flex-col pr-2 md:pr-0 md:min-w-[340px] space-y-2 md:space-y-3">
            <div className="animated-bg h-6 md:h-10"></div>
            <div className="animated-bg h-4 md:h-6 md:w-40"></div>
          </div>
        </div>
      )
    }

  if(recommended) {
    return (
      <div 
        className="flex flex-col md:flex-row md:space-x-2 group"
      >
        <div 
          className="aspect-[16/9] animated-bg md:w-44 flex-shrink-0"
        ></div>
        {/* Details - above 768px */}
        <div className="hidden md:flex flex-col">
          {/* Title */}
          <div className="font-semibold line-clamp-2 animated-bg text-xs w-40 mb-2">
            &nbsp;
          </div>
          {/* Author */}
          <div 
            className="text-secondary animated-bg text-xs w-24 mb-1"
          >
            &nbsp;
          </div>
        </div>
        {/* Details - below 768px */}
        <div className="flex items-start space-x-3 p-3 pb-6 bg-white dark:bg-black
        xs:px-1 md:px-0 md:hidden">
          {/* Profile Picture */}
          <div 
            className="w-10 h-10 md:w-9 md:h-9 rounded-full flex-shrink-0 animated-bg"
          />
          {/* Details */}
          <div className="flex flex-col">
            {/* Title */}
            <div className="font-semibold line-clamp-2 mb-2 w-48 animated-bg text-xs">
              &nbsp;
            </div>
            {/* Author */}
            <div 
              className="text-[10px] text-secondary w-32 animated-bg"
            >
              &nbsp;
            </div>
          </div>
        </div>
      </div>
    )

  }

  return (
    <div 
      className="flex flex-col"
    >
       <div 
        className="aspect-[16/9] animated-bg"
       ></div>
       <div className="flex items-start space-x-3 p-3 pb-6 bg-white dark:bg-black
       xs:px-1 md:px-0">
          {/* Profile Picture */}
          {
            !noProfile && (
              <div 
                className="w-8 h-8 md:w-9 md:h-9 rounded-full animated-bg flex-shrink-0"
              ></div>
            )
          }

          {/* Details */}
          <div className="flex-1 flex flex-col">
            {/* Title */}
            <div className="font-semibold line-clamp-2 mb-4 w-4/5 animated-bg">
              &nbsp;
            </div>
            {/* Author */}
            <div 
              className="text-sm text-secondary w-3/5 animated-bg"
            >
              &nbsp;
            </div>
          </div>
       </div>
    </div>
  )
}
export default ThumbnailSkeleton