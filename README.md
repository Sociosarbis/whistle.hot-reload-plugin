## Setup
1. `git pull https://github.com/Sociosarbis/whistle.hot-reload-plugin.git`
2. `cd whistle.hot-reload-plugin`
3. `npm install`
4. `npm link`
## Get Started
1. `w2 stop`
2. `w2 start`
3. **plugin rule syntax**:
  `pattern whistle.hot-reload-plugin://path1,...,pathN`
  
   path是glob可识别的字符串，如果需要监听多个path，使用,进行分隔。 
