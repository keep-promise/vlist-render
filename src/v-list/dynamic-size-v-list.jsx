import React, { useState, forwardRef, useCallback, useMemo } from "react";
import { flushSync } from "react-dom";

// 提供一个列表项预设高度，在列表项渲染完成后，再更新高度
function DynamicSizeVlist(props, ref) {
  const { containerHeight, getItemHeight, itemCount, itemData, children: Component } = props;
  ref.current = {
    resetHeight: () => {
      setOffsets(genOffsets())
    }
  };

  const [scrollTop, setScrollTop] = useState(0);

  // 根据 getItemHeight 生成 offsets
  const genOffsets = useCallback(() => {
    const a = [];
    a[0] = getItemHeight(0);
    for(let i = 1; i< itemCount; i++) {
      a[i] = getItemHeight(i) + a[i-1];
    }
    return a;
  }, [getItemHeight, itemCount]);

  // 所有 items 的位置
  const [offsets, setOffsets] = useState(() => genOffsets());

  const { startIndex, endIndex } = useMemo(() => {
    let startIndex = offsets.findIndex((pos) => pos > scrollTop);
    let endIndex = offsets.findIndex((pos) => pos > scrollTop + containerHeight);
    if (endIndex == -1) endIndex = itemCount;

    const paddingCount = 2;
    startIndex = Math.max(startIndex-paddingCount, 0);
    endIndex = Math.min(endIndex+paddingCount, itemCount-1);

    return {
      startIndex,
      endIndex
    }
  }, [scrollTop, itemCount]);

  // 计算内容的总高度
  const contentHeight = offsets[offsets.length - 1];

  const RenderItems = useMemo(() => {
    const res = [];
    for(let i = startIndex; i<=endIndex; i++) {
      const top = i == 0 ? 0 : offsets[i-1];
      const height = i == 0 ? offsets[0] : offsets[i] - offsets[i-1];
      res.push(<Component 
        index={i} 
        style={{
          position: 'absolute',
          left: 0,
          top,
          height
        }}
        data={itemData}
      />)
    }
    return res;
  }, [startIndex, endIndex]);

  return (
    <div
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={(e) => {
        flushSync(() => {
          setScrollTop(e.target.scrollTop);
        })
      }}
    >
      <div style={{height: contentHeight}}>{RenderItems}</div>
    </div>
  )

}

export default forwardRef(DynamicSizeVlist);

// 和列表项等高的实现不同，不能传一个固定值 itemHeight，
// 改为传入一个根据 index 获取列表项宽度函数 getItemHeight(index)。

// 组件会通过这个函数，来拿到不同列表项的高度，来计算出 offsets 数组。
// offsets 是每个列表项的底边到顶部的距离。offsets 的作用是在滚动到特定位置时，
// 计算出需要渲染的列表项有哪些。

// 当然你也可以用高度数组，但查找起来并没有优势，你需要累加。
// offsets 是 heights 的累加缓存结果（其实也就是前缀和）。

// 假设几个列表项的高度数组 heights 为 [10, 20, 40, 100]，那么 offsets 就是 [10, 30, 70, 170]。
// 一推导公式为：offsets[i] = offsets[i-1] + heights[i]

