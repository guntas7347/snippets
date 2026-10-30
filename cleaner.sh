#!/usr/bin/env bash

# Default folders to target
targets=("node_modules" ".next" "dist" "build")

scan=false
delete=false
stop_requested=false

show_help() {
cat << EOF
Usage:
  ./cleaner.sh -scan
  ./cleaner.sh -delete

Options:
  -scan                Scan matching folders and report total size
  -delete              Delete matching folders
  -name <folders...>   Override default folder list

Default folders:
  node_modules
  .next
  dist
  build

Examples:
  ./cleaner.sh -scan

  ./cleaner.sh -delete

  ./cleaner.sh -name node_modules .next -scan

  ./cleaner.sh -name dist build coverage -delete

  ./cleaner.sh -help
EOF
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        -name)
            shift
            targets=()

            while [[ $# -gt 0 && "$1" != -* ]]; do
                targets+=("$1")
                shift
            done
            ;;
        -scan)
            scan=true
            shift
            ;;
        -delete)
            delete=true
            shift
            ;;
        -help|-h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo
            show_help
            exit 1
            ;;
    esac
done

trap 'stop_requested=true' SIGINT

find_targets() {
    local folders=()

    for target in "${targets[@]}"; do
        while IFS= read -r path; do
            folders+=("$path")
        done < <(find . -type d -name "$target" 2>/dev/null)
    done

    printf '%s\n' "${folders[@]}"
}

get_folder_size() {
    mapfile -t folders < <(find_targets)

    if [[ ${#folders[@]} -eq 0 ]]; then
        echo "No matching folders found."
        return
    fi

    local total=0
    local count=0
    local total_count=${#folders[@]}

    for f in "${folders[@]}"; do
        if $stop_requested; then
            echo -e "\nScan interrupted."
            break
        fi

        size=$(du -sb "$f" 2>/dev/null | awk '{print $1}')
        total=$((total + size))

        ((count++))
        printf "\rScanning: %.2f%%" \
            "$(awk "BEGIN {print ($count/$total_count)*100}")"
    done

    echo
    echo "Done."

    gb=$(awk "BEGIN {printf \"%.2f\", $total/1024/1024/1024}")

    echo
    echo "Folders scanned : $count"
    echo "Total size      : $gb GB"
}

delete_folders() {
    mapfile -t folders < <(find_targets)

    if [[ ${#folders[@]} -eq 0 ]]; then
        echo "No matching folders found."
        return
    fi

    local count=0
    local total_count=${#folders[@]}

    for f in "${folders[@]}"; do
        if $stop_requested; then
            echo -e "\nDeletion interrupted."
            break
        fi

        ((count++))
        printf "\rDeleting: %.2f%%" \
            "$(awk "BEGIN {print ($count/$total_count)*100}")"

        rm -rf "$f"
    done

    echo
    echo "Done."
    echo "Processed $count / $total_count folders."
}

if $scan && $delete; then
    echo "Choose either -scan or -delete, not both."
    exit 1
fi

if ! $scan && ! $delete; then
    show_help
    exit 1
fi

if $scan; then
    get_folder_size
else
    delete_folders
fi
