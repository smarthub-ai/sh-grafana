// Code generated by Wire. DO NOT EDIT.

//go:generate go run -mod=mod github.com/google/wire/cmd/wire
//go:build !wireinject
// +build !wireinject

package main

import (
	"example.com/foo"
)

// Injectors from wire.go:

func injectFooer() foo.Fooer {
	bar := provideBar()
	return bar
}