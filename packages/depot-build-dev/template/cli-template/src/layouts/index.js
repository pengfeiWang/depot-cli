import * as React from 'react';
import withRouter from 'depot/withRouter';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { LocaleProvider } from 'antd';

// import router from 'depot/router';

import Header from './Header';
import './index.less';

class Layout extends React.PureComponent {
  state = {
  };

  componentWillMount() {
    // 0
  }

  componentWillReceiveProps() {
    // 0
  }

  render() {
    const {
      // route: { routes }
    } = this.props;
    return (
      <LocaleProvider locale={zhCN}>
        <div>
          <img src={require('../assets/images/KpnpchXsobRgLElEozzI.svg')} alt="" />
          <Header />
          {this.props.children}
        </div>
      </LocaleProvider>
    );
  }
}
export default withRouter(Layout);
