// Code generated by MockGen. DO NOT EDIT.
// Source: github.com/replicatedhq/ship/pkg/specs/githubclient (interfaces: GitHubReleaseNotesFetcher)

// Package githubclient is a generated GoMock package.
package githubclient

import (
	context "context"
	reflect "reflect"

	gomock "github.com/golang/mock/gomock"
)

// MockGitHubReleaseNotesFetcher is a mock of GitHubReleaseNotesFetcher interface
type MockGitHubReleaseNotesFetcher struct {
	ctrl     *gomock.Controller
	recorder *MockGitHubReleaseNotesFetcherMockRecorder
}

// MockGitHubReleaseNotesFetcherMockRecorder is the mock recorder for MockGitHubReleaseNotesFetcher
type MockGitHubReleaseNotesFetcherMockRecorder struct {
	mock *MockGitHubReleaseNotesFetcher
}

// NewMockGitHubReleaseNotesFetcher creates a new mock instance
func NewMockGitHubReleaseNotesFetcher(ctrl *gomock.Controller) *MockGitHubReleaseNotesFetcher {
	mock := &MockGitHubReleaseNotesFetcher{ctrl: ctrl}
	mock.recorder = &MockGitHubReleaseNotesFetcherMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use
func (m *MockGitHubReleaseNotesFetcher) EXPECT() *MockGitHubReleaseNotesFetcherMockRecorder {
	return m.recorder
}

// ResolveReleaseNotes mocks base method
func (m *MockGitHubReleaseNotesFetcher) ResolveReleaseNotes(arg0 context.Context, arg1 string) (string, error) {
	ret := m.ctrl.Call(m, "ResolveReleaseNotes", arg0, arg1)
	ret0, _ := ret[0].(string)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// ResolveReleaseNotes indicates an expected call of ResolveReleaseNotes
func (mr *MockGitHubReleaseNotesFetcherMockRecorder) ResolveReleaseNotes(arg0, arg1 interface{}) *gomock.Call {
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "ResolveReleaseNotes", reflect.TypeOf((*MockGitHubReleaseNotesFetcher)(nil).ResolveReleaseNotes), arg0, arg1)
}
