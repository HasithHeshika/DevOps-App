pipeline {
    agent any
    
    environment {
        // DockerHub credentials ID (configured in Jenkins)
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        
        // DockerHub username (replace with your username)
        DOCKERHUB_USERNAME = 'hasithheshika'
        
        // Image names
        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/propertyhub-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/propertyhub-frontend"
        
        // Build timestamp
        BUILD_TIMESTAMP = sh(returnStdout: true, script: "date +%Y%m%d-%H%M%S").trim()
        
        // Git commit hash (short)
        GIT_COMMIT_SHORT = sh(returnStdout: true, script: "git rev-parse --short HEAD").trim()
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from GitHub...'
                checkout scm
                sh 'git rev-parse --short HEAD'
            }
        }
        
        stage('Verify Docker') {
            steps {
                echo 'Verifying Docker installation...'
                sh '''
                    docker --version
                    docker-compose --version
                '''
            }
        }
        
        stage('Build Backend Image') {
            steps {
                echo 'Building backend Docker image...'
                dir('backend') {
                    sh '''
                        docker build -t ${BACKEND_IMAGE}:latest \
                                   -t ${BACKEND_IMAGE}:${BUILD_TIMESTAMP} \
                                   -t ${BACKEND_IMAGE}:${GIT_COMMIT_SHORT} \
                                   .
                    '''
                }
            }
        }
        
        stage('Build Frontend Image') {
            steps {
                echo 'Building frontend Docker image...'
                dir('frontend') {
                    sh '''
                        docker build -t ${FRONTEND_IMAGE}:latest \
                                   -t ${FRONTEND_IMAGE}:${BUILD_TIMESTAMP} \
                                   -t ${FRONTEND_IMAGE}:${GIT_COMMIT_SHORT} \
                                   .
                    '''
                }
            }
        }
        
        stage('Test Images') {
            steps {
                echo 'Testing built images...'
                sh '''
                    # Verify images were created
                    docker images | grep propertyhub
                    
                    # Test backend container
                    echo "Testing backend image..."
                    docker run --rm ${BACKEND_IMAGE}:latest node --version
                    
                    # Test frontend image
                    echo "Testing frontend image..."
                    docker run --rm ${FRONTEND_IMAGE}:latest nginx -v
                '''
            }
        }
        
        stage('Login to DockerHub') {
            steps {
                echo 'Logging in to DockerHub...'
                sh '''
                    echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
                '''
            }
        }
        
        stage('Push Backend to DockerHub') {
            steps {
                echo 'Pushing backend images to DockerHub...'
                sh '''
                    docker push ${BACKEND_IMAGE}:latest
                    docker push ${BACKEND_IMAGE}:${BUILD_TIMESTAMP}
                    docker push ${BACKEND_IMAGE}:${GIT_COMMIT_SHORT}
                '''
            }
        }
        
        stage('Push Frontend to DockerHub') {
            steps {
                echo 'Pushing frontend images to DockerHub...'
                sh '''
                    docker push ${FRONTEND_IMAGE}:latest
                    docker push ${FRONTEND_IMAGE}:${BUILD_TIMESTAMP}
                    docker push ${FRONTEND_IMAGE}:${GIT_COMMIT_SHORT}
                '''
            }
        }
        
        stage('Cleanup') {
            steps {
                echo 'Cleaning up old images...'
                sh '''
                    # Remove dangling images
                    docker image prune -f
                '''
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
            echo "Backend images pushed: ${BACKEND_IMAGE}:latest, :${BUILD_TIMESTAMP}, :${GIT_COMMIT_SHORT}"
            echo "Frontend images pushed: ${FRONTEND_IMAGE}:latest, :${BUILD_TIMESTAMP}, :${GIT_COMMIT_SHORT}"
        }
        
        failure {
            echo 'Pipeline failed! Check the logs for details.'
        }
        
        always {
            echo 'Logging out from DockerHub...'
            sh 'docker logout || true'
            
            echo 'Cleaning up workspace...'
            cleanWs()
        }
    }
}
