import React, { useMemo, useState } from "react";
import { flushSync } from "react-dom";

export default function FixedSizeList(props) {
  const { containerHeight, itemHeight, itemCount, Component } = props;

  // 滚动总高度
  const contentHeight = itemCount * itemHeight;

  // 滚动位置
  const [scrollTop, setScrollTop] = useState(0); 

  const { startIndex, endIndex } = useMemo(() => {
    let startIndex = Math.floor(scrollTop/itemHeight);
    let endIndex = startIndex + Math.floor(containerHeight/itemHeight);
    // 上下额外多渲染 2个 item，解决滚动时来不及加载元素出现短暂的空白区域的问题
    const paddingCount = 2;
    startIndex = Math.max(startIndex-paddingCount, 0);
    endIndex = Math.min(endIndex+paddingCount, itemCount - 1);
    return {
      startIndex,
      endIndex
    }
  }, [scrollTop, itemHeight, itemCount]);

  const top = itemHeight * startIndex;

  const RenderItems = useMemo(() => {
    const res = []
    for(let i = startIndex; i<= endIndex; i++) {
      res.push(<Component key={i} index={i} styles={{ height: itemHeight }} />)
    }
    return res;
  }, [Component, startIndex, endIndex]);

  return (
    <div
      style={{height: containerHeight, overflow: 'auto'}}
      onScroll={(e) => {
        flushSync(() => {
          setScrollTop(e.target.scrollTop);
        })
      }}
    >
      <div style={{height: contentHeight}}>
        {/* 一个将 items 往下推到正确位置的空元素 */}
        <div style={{ height: top }}></div>
        {RenderItems}
      </div>
    </div>
  )
}

// 最外层是“容器 div”，给它的高度设置传入的 containerHeight。

// 接着是“内容 div”。contentHeight 由 itemHeight 乘以 itemCount 计算而来，
// 代表的是所有 item 组成的高度。我们把它放着这里，是为了让 “容器 div” 产生正确的滚动条。

// 内容 div 下是我们的 items，以及开头的 一个将 items 往下推到正确位置的空元素，
// 可以看作是一种 padding-top。它的高度值 top 由 itemHeight 乘以 startIdx 计算而来。

// 然后是监听滚动事件，当 scrollTop 改变时，更新组件。这里使用的是 React18，默认是并发模式，
// 更新状态 setState 是异步的，因此在快速滚动的情况下，会出现渲染不实时导致的短暂空白现象。

// 所以这里我用了 ReactDOM 的 flushSync 方法，让状态的更新变成同步的，来解决短暂空白问题。

// 但滚动是一个高频触发的时间，我的这种写法在列表项复杂的情况下，是可能会出现性能问题的。
// 更好的做法是做 函数节流 + RAF（requestAnimationFrame），虽然也会有一些空白现象，但不会太严重


