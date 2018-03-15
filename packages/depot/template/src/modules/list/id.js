import router from 'depot/router';
import { connect } from 'dva';

export default connect(state => ({
  global: state.global
}))(({ dispatch }) => {
  const submit = () => {
    console.log('submit');
    dispatch({
      type: 'global/loginSubmit',
      payload: {
        userName: 'w.pengfei'
      }
    });
  };
  return (
    <div>
      <p>列表页</p>
      <p><a onClick={() => { submit(); }}>发起数据请求</a></p>
      <p>
        <a
          onClick={() => {
            router.goBack();
          }}
        >
          goBack
        </a>
      </p>
      <p>null</p>
    </div>
  );
});
