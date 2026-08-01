package com.livehorizon.common;

/** The {"message": "..."} envelope the frontend already reads on every error. */
public record MessageResponse(String message) {
}
