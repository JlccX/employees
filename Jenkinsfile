

pipeline {

  agent none

  environment {

      GITHUB_TOKEN = credentials("JLCCX-JENKINS.WFO.TOOLS-GithubPersonalAccessToken")
      ALLOWED_DOMAINS="nice.com,niceincontact.com,incontact.com,servion.com"
      AWS_ACCESS_KEY_ID = credentials('JLCCX-AWS-ACCESS-KEY')
      AWS_SECRET_ACCESS_KEY = credentials('JLCCX-AWS-SECRET-KEY')
      ALLOWED_ORIGINS="https://cicd-self-service-portal.s3.amazonaws.com"
      GITHUB_CLIENT_ID = credentials("JLCCX-GITHUB-CLIENT-ID")
      SELFSERVICE_API_KEY = credentials('JLCCX-AWS-API-KEY')
      AWS_REGION="us-east-1"
      SOURCE_CODE_FOLDER="git-self-service-portal"
      AWS_RUNTIME_APP="nodejs6.10"
      AWS_ROLE="arn:aws:iam::032474939542:role/SelfServicePortal"
      AWS_STAGE="dev"
      AWS_API_GATEWAY_NAME="SelfServicePortal"
      AWS_SWAGGER_FILENAME="SelfServicePortal-v1-swagger-integrations,authorizers,documentation,validators,gatewayresponses.json"
      AWS_BASE_URL="https://m124hr8qcc.execute-api.us-east-1.amazonaws.com/"
      GITHUB_USERNAME="jlccx-incontact"
      TIMEOUT=10000
      DEV_BUCKET="cicd-self-service-portal-dev"
      PRODUCTION_BUCKET="cicd-self-service-portal"
  }


  stages {

    stage ('info') {
      agent any
      steps {

        sh '''
          set +ex
          // printf "The NODE_NAME parameter is: ${NODE_NAME}\n"
          printf "The GIT_URL value is: ${GIT_URL}\n"
          printf "The GIT_BRANCH value is: ${GIT_BRANCH}\n"
          printf "\nThe host operating system properties are:\n"
          uname -a
        '''
      }
    }
      

    stage('pre-deploy') {
      steps {
        script {
          node('master') {

            docker.withRegistry("http://incontact-docker-snapshot-local.jfrog.io","ARTIFACTORY-CREDENTIALS") {
              docker.image("cicd-node-toolbox:latest").inside("-u root:root") {

                dir("$SOURCE_CODE_FOLDER") {
                    checkout([$class: 'GitSCM', branches: [[name: '*/jenkins']], doGenerateSubmoduleConfigurations: false, extensions: [], submoduleCfg: [], userRemoteConfigs: [[credentialsId: 'Jenkins.wfo.tools-SSH-private-Key', url: 'git@github.com:jlccx-incontact/cicd-selfserviceportal.git']]])
                }

                sh '''
                  set +ex
                  chmod +x $SOURCE_CODE_FOLDER/scripts/pre-deploy.test.sh
                  $SOURCE_CODE_FOLDER/scripts/pre-deploy.test.sh $GITHUB_TOKEN $ALLOWED_DOMAINS $AWS_ACCESS_KEY_ID $AWS_SECRET_ACCESS_KEY $ALLOWED_ORIGINS $GITHUB_CLIENT_ID $SELFSERVICE_API_KEY $AWS_REGION $SOURCE_CODE_FOLDER
                '''

                stash name: "$SOURCE_CODE_FOLDER", includes: "$SOURCE_CODE_FOLDER/*"
              }
            }
          }
        }
      }
    }


    stage("Sonarqube - Quality Gates") {
      steps {
        script {
          node('master') {
            docker.withRegistry("http://incontact-docker-snapshot-local.jfrog.io","ARTIFACTORY-CREDENTIALS"){
              docker.image("cicd-sonar_cli-resource").inside("-u root:root"){

                dir("$SOURCE_CODE_FOLDER") {
                    unstash "$SOURCE_CODE_FOLDER"
                    sh 'printf "\nThe stashed files are:\n"'
                    sh 'ls $SOURCE_CODE_FOLDER'
                }

                sh '''
                  set +ex
                  ls $SOURCE_CODE_FOLDER
                  printf "The stash folder search results are:\n"
                  find / -iname "$STASH_SHARED_CODE"
                  printf "The current pwd command response is:\n"
                  pwd
                  printf "The JOB_NAME is:${JOB_NAME}"
                  printf "The JOB_BASE_NAME is:${JOB_BASE_NAME}"
                  printf "The source code folder is: $SOURCE_CODE_FOLDER"
                '''

                // dir("$SOURCE_CODE_FOLDER"){
                //     git url: 'https://github.com/jlccx-incontact/cicd-selfserviceportal.git'
                // }

                sh '''
                  set +ex
                  chmod +x $SOURCE_CODE_FOLDER/scripts/jenkins.code-coverage.sh
                  #$SOURCE_CODE_FOLDER/scripts/jenkins.code-coverage.sh $GITHUB_TOKEN $ALLOWED_DOMAINS $AWS_ACCESS_KEY_ID $AWS_SECRET_ACCESS_KEY $ALLOWED_ORIGINS $GITHUB_CLIENT_ID $SELFSERVICE_API_KEY $AWS_REGION $SOURCE_CODE_FOLDER
                '''
              }
            }
          }
        }
      }
    }


    stage("upload-code-to-s3-bucket"){
      steps {
        script {
          node {
            docker.withRegistry("http://incontact-docker-snapshot-local.jfrog.io","ARTIFACTORY-CREDENTIALS"){
              docker.image("cicd-awscli-toolbox").inside("-u root:root"){
                dir("$SOURCE_CODE_FOLDER") {
                    unstash "$SOURCE_CODE_FOLDER"
                    sh 'printf "The stashed s3 files are:\n"'
                    sh 'ls $SOURCE_CODE_FOLDER'
                }
                sh '''
                  set +ex
                  chmod +x $SOURCE_CODE_FOLDER/scripts/configure.aws-cli.sh
                  $SOURCE_CODE_FOLDER/scripts/configure.aws-cli.sh $AWS_ACCESS_KEY_ID $AWS_SECRET_ACCESS_KEY $AWS_REGION

                  echo "Testing Pipeline execution" > $SOURCE_CODE_FOLDER/website/test.txt

                  chmod +x $SOURCE_CODE_FOLDER/scripts/s3-sync.bucket.sh
                  $SOURCE_CODE_FOLDER/scripts/s3-sync.bucket.sh $AWS_ACCESS_KEY_ID $AWS_SECRET_ACCESS_KEY $AWS_REGION $SOURCE_CODE_FOLDER $DEV_BUCKET
                '''
              }
            }
          }
        }
      }
    }


    stage("add-lambda-functions"){
      steps {
        script {
          node {
            docker.withRegistry("http://incontact-docker-snapshot-local.jfrog.io","ARTIFACTORY-CREDENTIALS"){
              docker.image("cicd-awscli-toolbox").inside("-u root:root"){
                sh '''
                  set +ex
                  chmod +x $SOURCE_CODE_FOLDER/scripts/add.lambda.functions.sh
                  $SOURCE_CODE_FOLDER/scripts/add.lambda.functions.sh $AWS_RUNTIME_APP $AWS_ROLE $AWS_REGION $AWS_ACCESS_KEY_ID $AWS_SECRET_ACCESS_KEY $SOURCE_CODE_FOLDER
                '''
              }
            }
          }
        }
      }
    }
  
    stage("deploy-tests"){
      steps {
        script {
          node {
            docker.withRegistry("http://incontact-docker-snapshot-local.jfrog.io","ARTIFACTORY-CREDENTIALS"){
              docker.image("cicd-node-toolbox").inside("-u root:root"){
                sh '''
                    set +ex
                    printf "\nThe deploy test execution was canceled.\n"
                    chmod +x $SOURCE_CODE_FOLDER/scripts/deploy.test.sh
                    printf "\nAdding eecution permissions to the script.\n"
                    #$SOURCE_CODE_FOLDER/scripts/deploy.test.sh $SOURCE_CODE_FOLDER $SELFSERVICE_API_KEY $AWS_BASE_URL $AWS_STAGE $GITHUB_USERNAME $GITHUB_TOKEN $ALLOWED_ORIGINS $TIMEOUT
                '''
              }
            }
          }
        }
      }
    }

  }
}