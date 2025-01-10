if ! command -v tmux &> /dev/null
then
    echo "tmux could not be found"
    echo "brew install tmux" 
    exit 1
fi

tmux kill-session -t tesseract_session

tmux new-session -d -s tesseract_session 'cd apps/cloudflare-logic && pnpm start'
tmux split-window 'pnpm docker:reset && docker attach hasura-graphql-1'
tmux split-window 'cd apps/preshow-gameshow && pnpm start'
tmux split-window
tmux select-layout tiled

tmux attach
