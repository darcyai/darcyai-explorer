import React from 'react'

const useHighlight = (conditions: any[]): React.RefCallback<any> => React.useCallback((codeElement) => {
  if (codeElement != null) {
    (window as any).Prism?.highlightAllUnder(codeElement)
  }
}, conditions)

export default useHighlight
