package com.legal.legalbot.services.ai;

public record TaskResult<T>(
        Status status,
        String question,
        T data
) {
    public enum Status {
        NEEDS_INFO,
        COMPLETE
    }

    public static <T> TaskResult<T> needsInfo(String question) {
        return new TaskResult<>(Status.NEEDS_INFO, question, null);
    }

    public static <T> TaskResult<T> complete(T data) {
        return new TaskResult<>(Status.COMPLETE, null, data);
    }

    public boolean isComplete() {
        return status == Status.COMPLETE;
    }
}
