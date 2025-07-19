#!/bin/bash

# --- Configuration ---
# Set the path to your main Git repository root
# Make sure this matches the directory where your .git folder is located
REPO_ROOT="C:/Users/927707/Documents/Small multiples Project/GITREACT/app-met-cp-gh-pages/app-met-cp-gh-pages/"
BRANCH="react-dashboard" # Your deployment branch

# --- Script Logic ---

echo "Starting full commit and push process for branch: $BRANCH"
echo "---------------------------------------------------------"

# Navigate to the repository root
cd "$REPO_ROOT" || { echo "Error: Could not change to directory $REPO_ROOT. Exiting."; exit 1; }

# Add all changes to the staging area
echo "Adding all changes to Git staging area..."
git add .
if [ $? -ne 0 ]; then
    echo "Error: git add failed. Please check for issues."
    exit 1
fi

# Check for staged changes before committing
if git diff --cached --exit-code; then
    echo "No changes detected to commit. Working tree clean."
else
    # Prompt for commit message
    read -p "Enter your commit message: " COMMIT_MESSAGE

    if [ -z "$COMMIT_MESSAGE" ]; then
        echo "Commit message cannot be empty. Aborting commit."
        exit 1
    fi

    # Commit the changes
    echo "Committing changes with message: \"$COMMIT_MESSAGE\""
    git commit -m "$COMMIT_MESSAGE"
    if [ $? -ne 0 ]; then
        echo "Error: git commit failed."
        exit 1
    fi
fi

# Push to the remote repository
echo "Pushing changes to remote branch $BRANCH..."
git push -u origin "$BRANCH"
if [ $? -ne 0 ]; then
    echo "Error: git push failed. Please resolve conflicts or check connection."
    exit 1
fi

echo "---------------------------------------------------------"
echo "Git operations completed successfully!"
echo ""
echo "NEXT STEP: Trigger the deployment on Netlify."
echo "1. Go to your Netlify Dashboard: https://app.netlify.com/"
echo "2. Select your site (marvelous-paprenjak-5a2446.netlify.app)."
echo "3. Go to the 'Deploys' tab."
echo "4. Netlify should automatically start a new deploy due to the push."
echo "   If not, click 'Trigger deploy' -> 'Deploy site'."
echo "---------------------------------------------------------"