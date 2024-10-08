const exec = require('child_process').exec;

const reg = /locate module "([^"]*)" from/; // 修改正则表达式以匹配模块名称
const i = () => {
  exec(`pnpm build`, (error, stdout, stderr) => {
    if (error) {
      const matchResult = reg.exec(error.toString());
      if (matchResult) { // 检查是否匹配成功
        exec(`pnpm i ${matchResult[1]}`)
        i();
      } else {
        console.log("finish");
      }
      return;
    }
  });
}
i();