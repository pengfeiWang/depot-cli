import Link from 'depot/link';
import { connect } from 'dva';
import classNames from 'classnames';
import { Button } from 'antd';
import styles from './css/index.less';

export default connect(state => ({
  global: state.global,
}))(({ /* dispatch */ }) => {
  const indexTieleTextStyle = classNames({
    [styles['large-size']]: 1,
    [styles['align-center']]: 1,
  });
  return (
    <div>
      <p className={indexTieleTextStyle}>首页</p>
      <div className={classNames(styles['btn-box'])}>
        <Link to="/list">
          <Button>list 列表页</Button>
        </Link>
        <Link to="/demo">
          <Button>demo 演示页</Button>
        </Link>
      </div>
    </div>
  );
});
