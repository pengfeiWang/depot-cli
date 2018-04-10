import * as React from 'react';
import withRouter from 'depot/withRouter';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { LocaleProvider } from 'antd';
// import router from 'depot/router';

import Header from './Header';
import './index.less';

@withRouter
export default class extends React.PureComponent {
  state = {
  };
  componentWillMount() {

  }
  componentWillReceiveProps() {

  }
  render() {
    const {
      // route: { routes }
    } = this.props;
    // console.log('routes:', routes);
    return (
      <LocaleProvider locale={zhCN}>
        <div>
          <Header />
          {this.props.children}
        </div>
      </LocaleProvider>
    );
  }
}
