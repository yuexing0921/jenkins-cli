**JK** is a command-line tool for Jenkins interactions to quickly release Jenkins tasks and save development time.



## Install

```bash
npx jenkins-cli-node              				*# Run once.*

npm install -g jenkins-cli-node         	*# Run multiple.*

npm install --dev jenkins-cli-node       	*# Install locally* 
```



## Quick start



## 

## CLI

| Option            | Description                                                  | Example            |
| ----------------- | ------------------------------------------------------------ | ------------------ |
| --config<br /> -c | Jenkins configuration, default values are .jenkins.yaml<br /><br />By default, it is found from the current directory. If it is not found, it is found from the user's root directory.<br />This configuration is based on https://github.com/silas/node-jenkins<br />baseUrl: https://user:pass@jenkins.xxxxx.xxx<br />crumbIssuer: true | jk -c jenkins.yaml |
| --job <br />-j    | Job to be executed                                           | jk -j xxx          |