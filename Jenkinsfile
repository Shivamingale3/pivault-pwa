// Deploys a pivault-pwa image (static files built by GitHub Actions) to staging on the Pi.
// Triggered by GitHub's "package published" webhook, or manually with IMAGE_TAG.

def notify(String msg) {
  withCredentials([
    string(credentialsId: 'telegram-bot-token', variable: 'TG_TOKEN'),
    string(credentialsId: 'telegram-chat-id', variable: 'TG_CHAT')
  ]) {
    withEnv(["TG_MSG=${msg}"]) {
      sh 'curl -sS -X POST "https://api.telegram.org/bot$TG_TOKEN/sendMessage" -d chat_id="$TG_CHAT" --data-urlencode text="$TG_MSG" > /dev/null || true'
    }
  }
}

pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    timeout(time: 10, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  parameters {
    string(name: 'IMAGE_TAG', defaultValue: '', description: 'e.g. staging-abc1234 (the webhook fills this in)')
  }

  triggers {
    GenericTrigger(
      genericVariables: [[key: 'IMAGE_TAG', value: '$.package.package_version.container_metadata.tag.name', defaultValue: '']],
      tokenCredentialId: 'pivault-pwa-hook-token',
      regexpFilterText: '$IMAGE_TAG',
      regexpFilterExpression: '^staging-[0-9a-f]{7}$',
      causeString: 'GHCR published $IMAGE_TAG',
      printContributedVariables: true
    )
  }

  environment {
    IMAGE      = 'ghcr.io/shivamingale3/pivault-pwa'
    SITE_DIR   = '/var/www/pivault/staging'
    STATE_FILE = '/home/shiv/apps/pivault/.deploy/pwa.last-good'
    SITE_URL   = 'https://pivault-staging.shivamingale.com'
  }

  stages {
    stage('Validate') {
      steps {
        script {
          if (!(params.IMAGE_TAG ==~ /^staging-[0-9a-f]{7}$/)) {
            error "IMAGE_TAG '${params.IMAGE_TAG}' is not staging-<7 hex chars>"
          }
          env.TAG_OK = 'true'
          env.PREV_TAG = sh(script: 'cat "$STATE_FILE" 2>/dev/null || true', returnStdout: true).trim()
          echo "Deploying ${params.IMAGE_TAG} (rollback target: ${env.PREV_TAG ?: 'none'})"
        }
      }
    }

    stage('Pull') {
      steps {
        sh 'docker pull "$IMAGE:$IMAGE_TAG"'
      }
    }

    stage('Extract') {
      steps {
        sh '''
          R="$SITE_DIR/releases/$IMAGE_TAG"
          rm -rf "$R.tmp" && mkdir -p "$R.tmp"
          cid=$(docker create "$IMAGE:$IMAGE_TAG")
          trap 'docker rm "$cid" > /dev/null' EXIT
          docker cp "$cid":/site/. "$R.tmp"/
          test -f "$R.tmp/index.html"
          rm -rf "$R" && mv "$R.tmp" "$R"
        '''
      }
    }

    stage('Switch') {
      steps {
        // build the new symlink beside the old one, then rename over it (atomic)
        sh '''
          ln -sfn "$SITE_DIR/releases/$IMAGE_TAG" "$SITE_DIR/current.tmp"
          mv -Tf "$SITE_DIR/current.tmp" "$SITE_DIR/current"
        '''
      }
    }

    stage('Health') {
      steps {
        // the live site must serve this release's index.html and its main JS bundle
        sh '''
          asset=$(grep -o '/assets/[^"]*\\.js' "$SITE_DIR/releases/$IMAGE_TAG/index.html" | head -1)
          echo "expecting bundle $asset"
          for i in $(seq 1 12); do
            if curl -fsS "$SITE_URL/" | grep -qF "$asset" \
               && curl -fsS -o /dev/null "$SITE_URL$asset"; then
              echo "live"; exit 0
            fi
            echo "not live yet ($i/12)"; sleep 5
          done
          exit 1
        '''
      }
    }
  }

  post {
    success {
      sh '''
        mkdir -p "$(dirname "$STATE_FILE")"
        echo "$IMAGE_TAG" > "$STATE_FILE"
        # keep only the release and image that are live now
        find "$SITE_DIR/releases" -mindepth 1 -maxdepth 1 ! -name "$IMAGE_TAG" -exec rm -rf {} +
        docker images "$IMAGE" --format '{{.Tag}}' | grep -vx "$IMAGE_TAG" \
          | xargs -r -I{} docker rmi "$IMAGE:{}" || true
      '''
      notify("✅ pivault-pwa ${params.IMAGE_TAG} deployed to staging")
    }

    failure {
      script {
        def rolledBack = false
        if (env.TAG_OK == 'true') {
          if (env.PREV_TAG && env.PREV_TAG != params.IMAGE_TAG) {
            withEnv(["PREV=${env.PREV_TAG}"]) {
              sh '''
                if [ -d "$SITE_DIR/releases/$PREV" ]; then
                  ln -sfn "$SITE_DIR/releases/$PREV" "$SITE_DIR/current.tmp"
                  mv -Tf "$SITE_DIR/current.tmp" "$SITE_DIR/current"
                fi
                rm -rf "$SITE_DIR/releases/$IMAGE_TAG" "$SITE_DIR/releases/$IMAGE_TAG.tmp"
              '''
            }
            rolledBack = true
          }
        }
        def msg = "❌ pivault-pwa ${params.IMAGE_TAG} deploy FAILED"
        msg += rolledBack ? "\nserving ${env.PREV_TAG} (last good)" : "\nno rollback done"
        msg += "\n${env.BUILD_URL}console"
        notify(msg)
      }
    }
  }
}
