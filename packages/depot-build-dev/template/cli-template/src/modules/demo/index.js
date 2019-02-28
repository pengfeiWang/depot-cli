import router from 'depot/router';

export default () => {
  return (
    <div>
      <p>数据交互演示</p>
      <a
        onClick={() => {
          router.goBack();
        }}
      >
        goBack
      </a>
    </div>
  );
};
