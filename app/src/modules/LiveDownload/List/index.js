/* 下载列表 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, Affix } from 'antd';
import QueueAnim from 'rc-queue-anim';
import style from './style.sass';
import publicStyle from '../../publicMethod/public.sass';
import { downloadList } from '../store/reducer';

/* 初始化数据 */
const state: Function = createStructuredSelector({
  downloadList: createSelector(     // 下载列表
    (state: Object): Object | Array=>state.has('liveDownload') ? state.get('liveDownload').get('downloadList') : [],
    (data: Object | Array): Array=>data instanceof Array ? data : data.toJS()
  )
});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object=>({
  action: bindActionCreators({
    downloadList
  }, dispatch)
});

@connect(state, dispatch)
class List extends Component{
  // 清除列表
  onClear(event: Event): void{
    for(let i = this.props.downloadList.length - 1; i >= 0; i--){
      const item: Object = this.props.downloadList[i];
      if(!(item.child.killed === false && item.child.exitCode === null)){
        this.props.downloadList.splice(i, 1);
      }
    }
    this.props.action.downloadList({
      downloadList: this.props.downloadList.slice()
    });
  }
  // 取消下载
  onStop(item: Object, event: Event): void{
    item.child.kill();
  }
  downloadList(): Object{
    return this.props.downloadList.map((item: Object, index: Number): Object=>{
      return (
        <li key={ item.id }>
          <h4>
            <b className={ style.ft }>{ item.item.title }</b>
            <span>{ item.item.secondTitle }</span>
          </h4>
          <p>{ item.pSave }</p>
          {
            item.child.killed === false && item.child.exitCode === null ?
              (
                <Button className={ style.ar } type="danger" icon="close-square" onClick={ this.onStop.bind(this, item) }>取消下载</Button>
              ) : (
                <b className={ `${ style.ar } ${ style.cancelText }` }>已停止</b>
              )
          }
        </li>
      );
    });
  }
  render(): Object{
    return (
      <div>
        {/* 功能区 */}
        <Affix className={ publicStyle.affix }>
          <div className={ `${ publicStyle.toolsBox } clearfix` }>
            <div className={ publicStyle.fr }>
              <Button icon="close-square" onClick={ this.onClear.bind(this) }>全部清除</Button>
              <Link to="/LiveDownload">
                <Button className={ publicStyle.ml10 } type="danger" icon="poweroff">返回</Button>
              </Link>
            </div>
          </div>
        </Affix>
        <div className={ `${ publicStyle.tableBox } ${ style.detailList }` }>
          <QueueAnim component="ul" type="alpha" leaveReverse={ true }>
            { this.downloadList() }
          </QueueAnim>
        </div>
      </div>
    );
  }
}

export default List;