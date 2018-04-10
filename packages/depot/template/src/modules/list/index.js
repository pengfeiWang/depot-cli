import React, { PureComponent } from 'react';
import { connect } from 'dva';
// import router from 'depot/router';
import { Spin, Button, Icon, Popconfirm, Modal, Form, Input } from 'antd';
import classNames from 'classnames';
import { TweenOneGroup } from 'rc-tween-one';
import styles from './css/index.less';

const FormItem = Form.Item;
/**
 * 连接 model (store)
 */
@connect(state => {
  return {
    app: state.app,
    list: state.listModel
  };
}) // 这里不能有 `;` 分号, @connect 是高阶函数, 还未结束
@Form.create() // 这里不能有 `;` 分号, @Form.create() 是高阶函数, 还未结束
export default class List extends PureComponent {
  constructor(props) {
    super(props);
    this.enterAnim = [
      {
        opacity: 0, x: 30, duration: 0,
      },
      {
        height: 0,
        duration: 200,
        type: 'from',
        delay: 250,
        ease: 'easeOutQuad',
        onComplete: this.onEnd,
      },
      {
        opacity: 1, x: 0, duration: 250, ease: 'easeOutQuad',
      },
      { delay: 1000 },
    ];
    this.leaveAnim = [
      { duration: 250, opacity: 0, backgroundColor: '#ff0000' },
      { height: 0, duration: 200, ease: 'easeOutQuad' },
    ];
  }
  state = {
    isShowModal: false,
    selectItem: '',
  }
  componentWillMount() {
    this.requestData();
  }

  // 请求数据
  requestData = () => {
    this.props.dispatch({
      type: 'listModel/fetch'
    });
  }
  /**
   * 新增一行
   */
  addRow = () => {
    console.log('add');
    this.props.dispatch({
      type: 'listModel/addRow'
    });
  }
  /**
   * 删除一行
   * type: string['' | 'top]
   */
  delRow = (type = '', item = '') => {
    const payload = {
      type, item
    };
    this.props.dispatch({
      type: 'listModel/delRow',
      payload
    });
  }
  editRow = () => {
    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.props.dispatch({
        type: 'listModel/editRow',
        payload: {
          ...values
        }
      });
    });
  }
  showModal = (it) => {
    this.setState({
      isShowModal: true,
      selectItem: it
    });
  }
  hideModal = () => {
    this.setState({
      isShowModal: false,
      selectItem: ''
    });
  }
  render() {
    const { app, list: { dataList }, form } = this.props;
    const { getFieldDecorator } = form;
    const { loading } = app;
    // console.log(app, dataList);
    return (
      <Spin spinning={loading} className="wrapper">
        <div className={classNames(styles['btn-box'])}>
          <Button onClick={this.requestData}>请求新数据</Button>
          <Button onClick={this.addRow}>新增一行</Button>
          <Button onClick={() => { this.delRow('top'); }}>从顶部删除一行</Button>
          <Button onClick={() => { this.delRow(''); }}>从底部删除一行</Button>
        </div>
        <div className={styles.list}>
          <TweenOneGroup
            className="table-enter-leave-demo"
            enter={this.enterAnim}
            leave={this.leaveAnim}
            appear={false}
          >
            {
              (dataList && !!dataList.length) && (
                dataList.map((it) => {
                  return (
                    <div className={classNames(styles['list-item'])} key={it.title}>
                      <Popconfirm
                        overlayClassName={classNames(styles['edit-btn'])}
                        title="确认删除?"
                        onConfirm={() => {
                          this.delRow('', it);
                        }}
                      >
                        <a className={classNames(styles['edit-btn'])} ><Icon type="delete" /></a>
                      </Popconfirm>
                      <a onClick={() => { this.showModal(it); }} className={classNames(styles['edit-btn'])} ><Icon type="edit" /></a>
                      <span>{it.title}</span>
                    </div>
                  );
                })
              )
            }
          </TweenOneGroup>
        </div>
        <Modal
          title="编辑"
          visible={this.state.isShowModal}
          onOk={this.editRow}
          onCancel={this.hideModal}
        >
          <Form>
            <FormItem>
              {
                getFieldDecorator('title', {
                  initialValue: this.state.selectItem.title || null,
                  rules: [
                    {
                      required: true
                    }
                  ]
                })(
                  <Input placeholder="标题" />
                )
              }
            </FormItem>
          </Form>
        </Modal>
      </Spin>
    );
  }
}

