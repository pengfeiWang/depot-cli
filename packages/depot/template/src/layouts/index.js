import * as React from 'react';
import withRouter from 'depot/withRouter';
// import router from 'depot/router';
import './index.less';

@withRouter
export default class extends React.PureComponent {
  state = {
  };
  componentWillMount() {
   
  }
  componentWillReceiveProps(nextProps) {
    
  }
  render() {
    const { menuData } = this.props;
    return (
      <div>
        <ul>
          {
            menuData.map((it) => {
              return (
                <li key={it.path}>
                  <p>title: {it.title}</p>
                  <p>icon: {it.icon}</p>
                  <p>path: {it.path}</p>
                </li>
              );
            })
          }
        </ul>
        {this.props.children}
      </div>
    );
  }
}
