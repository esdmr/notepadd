#!/usr/bin/sh

error=0

get_workspace_packages() {
	pnpm recursive exec pwd
}

run_attw() {
	echo "Running attw on $*"

	pnpm exec attw --profile esm-only --pack "$*" >.attw.log || {
		cat .attw.log
		error=1
	}

	test -d "$*/build" && run_attw "$*/build"
}

get_workspace_packages | while read -r pkg_dir
do
	run_attw "$pkg_dir"
done

rm .attw.log
exit $error
