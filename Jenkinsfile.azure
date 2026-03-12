pipeline {
    agent any

    tools {
        maven 'mvn-3.8'
    }

    environment {
        IMAGE_FRONTEND = "nsbyadav14e/siva_frontend"
        IMAGE_BACKEND  = "nsbyadav14e/siva_backend"
        AKS_CLUSTER    = "testcluster01"
        RESOURCE_GROUP = "cluster"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                url: 'https://github.com/Nallamekala-SivaBrahmaiah/java-web-application.git'
            }
        }

        stage('Build Maven Project') {
            steps {
                sh 'mvn clean package'
            }
        }

        stage('SonarQube Code Scan') {
            steps {
                withSonarQubeEnv('sonarqube') {
                    sh '''
                    mvn sonar:sonar \
                    -Dsonar.projectKey=java-web-application \
                    -Dsonar.sources=backend,frontend,src
                    '''
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                dir('backend') {
                    sh 'docker build -t $IMAGE_BACKEND:latest .'
                }
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                dir('frontend') {
                    sh 'docker build -t $IMAGE_FRONTEND:latest .'
                }
            }
        }

        stage('Push Images to DockerHub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker push $IMAGE_BACKEND:latest
                    docker push $IMAGE_FRONTEND:latest
                    '''
                }
            }
        }

        stage('Deploy to AKS') {
            steps {
                withCredentials([
                    string(credentialsId: 'azure-client-id', variable: 'AZ_CLIENT_ID'),
                    string(credentialsId: 'azure-client-secret', variable: 'AZ_CLIENT_SECRET'),
                    string(credentialsId: 'azure-tenant-id', variable: 'AZ_TENANT_ID'),
                    string(credentialsId: 'azure-subscription-id', variable: 'AZ_SUBSCRIPTION')
                ]) {

                    sh '''
                    az login --service-principal \
                    -u $AZ_CLIENT_ID \
                    -p $AZ_CLIENT_SECRET \
                    --tenant $AZ_TENANT_ID

                    az account set --subscription $AZ_SUBSCRIPTION

                    az aks get-credentials \
                    --resource-group $RESOURCE_GROUP \
                    --name $AKS_CLUSTER \
                    --overwrite-existing

                    kubectl delete -f lakeflip-k8s.yaml
                    '''
                }
            }
        }

    }
}
