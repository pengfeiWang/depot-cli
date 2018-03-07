import React, { PureComponent } from 'react';
// import cls from 'classnames/bind';
import { Link } from 'depot/Link';
import {
  Menu,
  Icon
} from 'antd';
// import { locale } from 'moment';

const { SubMenu } = Menu;

export default class GlobalMenu extends PureComponent {
  static defaultProps = {
    theme: 'light', // light dark
    mode: 'inline', // vertical vertical-right horizontal inline
    overlayClassName: ''
  }
  constructor(props) {
    super(props);
  }

  getNavMenuItems = (menus, parentPath = '') => {
    // const { location } = this.props;
    // const { pathname } = location;
    const menusData = [...menus];
    if (!menusData) {
      return [];
    }
    return menusData.map((item) => {
      if (!item.title || item.path === 'login') {
        return null;
      }
      let itemPath;
      if (item.path.indexOf('http') === 0) {
        itemPath = item.path;
      } else {
        itemPath = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
      }
      if (item.children && item.children.length && item.children.some(child => child.title)) {
        return (
          <SubMenu
            title={
              item.icon ? (
                <span>
                  <Icon type={item.icon} />
                  <span>{item.title}</span>
                </span>
              ) : item.title
            }
            key={item.key || item.path}
          >
            {this.getNavMenuItems(item.children, itemPath)}
          </SubMenu>
        );
      }
      const icon = item.icon && <Icon type={item.icon} />;
      return (
        <Menu.Item key={item.key || item.path}>
          {
            /^http?:\/\//.test(itemPath) ? (
              <a href={itemPath} target={item.target}>
                {icon}<span>{item.title}</span>
              </a>
            ) : (
              <Link
                to={itemPath}
                target={item.target}
              >
                {icon}<span>{item.title}</span>
              </Link>
            )
          }
        </Menu.Item>
      );
    });
  }
  getCurrentMenuSelectedKeys = () => {
    const { location: { pathname } } = this.props;
    const keys = pathname.split('/').slice(1);
    if (keys.length === 1 && keys[0] === '') {
      return ['/'];
    }
    return keys;
  }
  handleClick = () => {}
  handleOpenChange = () => {}
  render() {
    const { menus, theme, mode, style, overlayClassName } = this.props;
    return (
      <Menu
        theme={theme}
        mode={mode}
        style={style}
        className={overlayClassName}
        onOpenChange={this.handleOpenChange}
        selectedKeys={this.getCurrentMenuSelectedKeys()}
      >
        {this.getNavMenuItems(menus)}
      </Menu>
    );
  }
}
