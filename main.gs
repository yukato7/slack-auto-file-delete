var SLACK_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty("TOKEN");

/* チャンネルIDを全件取得 */
function listChannelIDs() {
  var res = UrlFetchApp.fetch('https://slack.com/api/channels.list?token=' + SLACK_ACCESS_TOKEN);
  var channelsList=JSON.parse(res.getContentText());
  var channelNames = channelsList.channels
  Logger.log(channelNames);
  return channelNames
}

/* グループIDを全件取得*/
function listGroupIDs() {
  var res = UrlFetchApp.fetch('https://slack.com/api/groups.list?token=' + SLACK_ACCESS_TOKEN);
  var channelsList=JSON.parse(res.getContentText());
  var groupNames = channelsList.groups
  return groupNames
}

function elapsedDaysToUnixTime(days){  
  var date = new Date();
  var now = Math.floor(date.getTime()/ 1000); // unixtime[sec]
  return now - 8.64e4 * days + '' // 8.64e4[sec] = 1[day] 文字列じゃないと動かないので型変換している
}


/* ファイルのリスト */
function filesList(data){
  var params = {
    'token': SLACK_ACCESS_TOKEN,
    'channel': data.channel,
    'ts_to': data.ts_to,
    'count': data.count
  }
  var options = {
    'method': 'GET',
    'payload': params
  }
  var res = UrlFetchApp.fetch('https://slack.com/api/files.list',options);
  return JSON.parse(res.getContentText());
}
 
/* ファイルを削除 */
function filesDelete(fileId){
  var payload = {
    'file': fileId
  }
  var options = {
    'method': 'POST',
    'payload': payload
  }
  var res = UrlFetchApp.fetch('https://slack.com/api/files.delete',options);
  return res
}

/* 古いファイルを一括で削除 */
function oldFileExecutioner(){
  const targetChannels = listChannelIDs();
  const targetGroups = listGroupIDs();
  targetChannels.forEach(deleteOldFile);
  targetGroups.forEach(deleteOldFile);
}

/* 特定日数より以前のファイルを削除 */
function deleteOldFile(channel) {
  const days = 30; // 遡る日数(ユーザが指定)
    var options = {
    channel: channel.id,
    ts_to: elapsedDaysToUnixTime(days),
    count: 1000
    }
    filesList(options).files.forEach(function(val){
      data = filesDelete(val.id);
      if (data.error) Logger.log('  Failed to delete file ' + val.name + ' Error: ' + data.error);
      else Logger.log('  Deleted file "' + val.name + '"(' + val.id + ')');
    });
}
