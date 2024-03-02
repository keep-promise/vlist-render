import { render } from 'react-dom';
import React, { useRef, useEffect } from 'react';
import FixedSizeVList from './v-list/fixed-size-v-list';
import DynamicSizeVList from './v-list/dynamic-size-v-list';
import { faker } from '@faker-js/faker';
import './index.css';

function FixedSizeItem(props) {
  const { index, styles } = props;
  const isOdd = index%2 === 1;
  return <div key={index} className={isOdd?'item-odd':'item-even'} style={styles}>{index}</div>
}

function FixedSizeApp() {
  return (
    <FixedSizeVList 
      containerHeight={500}
      itemHeight={100}
      itemCount={1000}
      Component={FixedSizeItem}
    />
  )
}

// 列表项组件
function DynamicSizeItem({ index, data, setHeight }) {
  const itemRef = useRef();

  useEffect(() => {
    setHeight(index, itemRef.current.getBoundingClientRect().height);
  }, [setHeight, index]);

  return (
    <div
      ref={itemRef}
      style={{
        backgroundColor: index % 2 === 0 ? 'burlywood' : 'cadetblue'
      }}
    >
      {data[index]}
    </div>
  );
}

const list = new Array(1000).fill(0).map(() => faker.lorem.paragraph())

function DynamicSizeApp() {
  const listRef = useRef();
  const heightsRef = useRef(new Array(1000));
  // 预估高度
  const estimatedItemHeight = 40;
  const getHeight = (index) => {
    return heightsRef.current[index] ?? estimatedItemHeight;
  };

  const setHeight = (index, height) => {
    if (heightsRef.current[index] !== height) {
      heightsRef.current[index] = height;
      // 让 DynamicSizeVList 组件更新高度
      listRef.current.resetHeight();
    }
  };

  return (
    // 列表项高度动态 - 虚拟列表实现
    <DynamicSizeVList
      ref={listRef}
      containerHeight={500}
      itemCount={list.length}
      getItemHeight={getHeight}
      itemData={list}
    >
      {({ index, style, data }) => {
        return (
          <div style={style}>
            <DynamicSizeItem {...{ index, data }} setHeight={setHeight} />
          </div>
        );
      }}
    </DynamicSizeVList>
  );
}

render(<DynamicSizeApp />, document.getElementById('app'));
