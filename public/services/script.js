/**
 * Created by viktorkrasnov on 25.05.16.
 */

function setOauthIFrameDialogSrc(src) {
    var oauthIFrame = document.getElementById('oauth-iframe-dialog');
    oauthIFrame.readyState = false;
    oauthIFrame.src = src;

    var loader = document.getElementById('oauth-iframe-dialog-loader');
    loader.style.display = 'block';

    oauthIFrame.onload = oauthIFrame.onLoad = function(e) {
        var block = document.getElementById('oauth-iframe-dialog-block'),
            error = document.getElementById('oauth-iframe-dialog-error');
        this.readyState = true;
        error.style.display = 'none';
        block.style.display = 'block';
    };

    oauthIFrame.onerror = oauthIFrame.onError = function() {
        var error = document.getElementById('oauth-iframe-dialog-error');
        loader.style.display = 'none';
        error.style.display = 'block';
        if (window.stop) {
            window.stop();
        } else {
            document.execCommand('Stop');
        }
    };

    setTimeout(function(){
        if(oauthIFrame.readyState === false){
            oauthIFrame.onerror();
        }
    }, 10000);
}