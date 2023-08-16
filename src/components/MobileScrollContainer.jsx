function MobileScrollContainer({ videoHeight, children }) {
  if(window.innerWidth < 768) {
    return (
      <div className="testing flex flex-col overflow-y-scroll scrollbar-hide md:overflow-y-auto"
      style={{
        height: `calc(100vh - ${videoHeight}px - 48px)`
      }}>
        { children }
      </div>
    )
  }

  return (
    <>{children}</>
  )
}
export default MobileScrollContainer