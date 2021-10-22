export const PageInLayoutDecorator = ({ children }) => {
  return (
    <div
      style={{
        height: '100%',
        flex: 1,
        position: 'relative',
        backgroundColor: 'white'
      }}
    >
      {children}
    </div>
  )
}